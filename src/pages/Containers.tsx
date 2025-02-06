import React, { useEffect, useState, useRef } from "react";
import { Table, Button, message, Space, Modal } from "antd";
import { ColumnsType } from "antd/es/table";
import type { Breakpoint } from "antd/es/_util/responsiveObserve";
import {
    fetchContainers,
    removeContainer,
    startContainer,
    stopContainer,
    restartContainer,
} from "../api/apiClient";
import { logContainer as rsocketLogContainer } from "../api/rsocketApi";

interface ContainerData {
    id: string;
    image: string;
    state: string;
    name: string;
}

interface RSocketSubscription {
    request: (n: number) => void;
    cancel: () => void;
}

const Containers: React.FC = () => {
    const [containers, setContainers] = useState<ContainerData[]>([]);
    const [loading, setLoading] = useState(false);
    const [logsVisible, setLogsVisible] = useState(false);
    const [logsContent, setLogsContent] = useState("");
    const logSubscriptionRef = useRef<RSocketSubscription | null>(null);

    const loadContainers = async () => {
        setLoading(true);
        try {
            const { data } = await fetchContainers(true);
            const formattedContainers: ContainerData[] = data.map((container: any) => ({
                id: container.Id,
                image: container.Image,
                state: container.State,
                name: container.Names[0],
            }));
            setContainers(formattedContainers);
        } catch (err) {
            message.error("Failed to fetch containers");
        } finally {
            setLoading(false);
        }
    };

    const shortenId = (id: string): string => {
        const prefix = "sha256:";
        const trimmed = id.startsWith(prefix) ? id.slice(prefix.length) : id;
        return trimmed.slice(0, 8);
    };

    const handleStart = async (id: string) => {
        try {
            await startContainer(id);
            message.success("Container started successfully");
            loadContainers();
        } catch (err) {
            message.error("Failed to start container");
        }
    };

    const handleStop = async (id: string) => {
        try {
            await stopContainer(id);
            message.success("Container stopped successfully");
            loadContainers();
        } catch (err) {
            message.error("Failed to stop container");
        }
    };

    const handleRestart = async (id: string) => {
        try {
            await restartContainer(id);
            message.success("Container restarted successfully");
            loadContainers();
        } catch (err) {
            message.error("Failed to restart container");
        }
    };

    const handleRemove = async (id: string) => {
        try {
            await removeContainer(id, true);
            message.success("Container removed successfully");
            loadContainers();
        } catch (err) {
            message.error("Failed to remove container");
        }
    };

    const handleViewLogs = (id: string) => {
        setLogsContent("");
        setLogsVisible(true);

        rsocketLogContainer("local", {
            id: id,
            follow: true,
            tail: 100,
        }).subscribe({
            onSubscribe: (subscription: RSocketSubscription) => {
                logSubscriptionRef.current = subscription;
                subscription.request(2147483647);
            },
            onNext: (log: unknown) => {
                setLogsContent((prev) => `${prev}${JSON.stringify(log)}\n`);
            },
            onError: (err: Error) => {
                message.error("Failed to fetch container logs");
                console.error(err)
                setLogsVisible(false);
            },
            onComplete: () => {
                console.log("Logs stream completed");
            },
        });
    };

    const handleCloseLogs = () => {
        setLogsVisible(false);
        if (logSubscriptionRef.current) {
            logSubscriptionRef.current.cancel();
            logSubscriptionRef.current = null;
        }
    };

    useEffect(() => {
        loadContainers();

        return () => {
            if (logSubscriptionRef.current) {
                logSubscriptionRef.current.cancel();
            }
        };
    }, []);

    const columns: ColumnsType<ContainerData> = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            render: (id: string) => shortenId(id),
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            responsive: ["md"] as Breakpoint[],
        },
        {
            title: "Image",
            dataIndex: "image",
            key: "image",
            responsive: ["md"] as Breakpoint[],
        },
        {
            title: "State",
            dataIndex: "state",
            key: "state",
            responsive: ["md"] as Breakpoint[],
            render: (state: string) => (
                <span
                    style={{
                        color: state === "running" ? "green" : "red",
                        fontWeight: "bold",
                    }}
                >
          {state}
        </span>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: unknown, record: ContainerData) => (
                <Space>
                    {record.state !== "running" && (
                        <Button type="primary" onClick={() => handleStart(record.id)}>
                            Start
                        </Button>
                    )}
                    {record.state === "running" && (
                        <Button onClick={() => handleStop(record.id)}>Stop</Button>
                    )}
                    <Button onClick={() => handleRestart(record.id)}>Restart</Button>
                    <Button danger onClick={() => handleRemove(record.id)}>
                        Delete
                    </Button>
                    <Button onClick={() => handleViewLogs(record.id)}>Logs</Button>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Table
                dataSource={containers}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 5 }}
            />
            <Modal
                title="Container Logs"
                open={logsVisible}
                onCancel={handleCloseLogs}
                footer={null}
                width={800}
            >
                <div
                    style={{
                        maxHeight: "400px",
                        overflowY: "auto",
                        whiteSpace: "pre-wrap",
                    }}
                >
                    {logsContent
                        .split("\n")
                        .filter((line) => line.trim() !== "")
                        .map((line, index) => {
                            try {
                                const log = JSON.parse(line);
                                const isError = log.type === "STDERR";
                                return (
                                    <div key={index} style={{ color: isError ? "red" : "inherit" }}>
                                        {log.payload}
                                    </div>
                                );
                            } catch (e) {
                                return (
                                    <div key={index} style={{ color: "orange" }}>
                                        {line}
                                    </div>
                                );
                            }
                        })}
                </div>
            </Modal>
        </>
    );
};

export default Containers;