import React, { useEffect, useState } from "react";
import { Table, Button, message, Modal } from "antd";
import { ColumnsType } from "antd/es/table";
import type { Breakpoint } from "antd/es/_util/responsiveObserve";
import { fetchImages, removeImage, inspectImage } from "../api/apiClient";

// Тип данных образа
interface ImageData {
    id: string;
    repoTag: string;
}

const Images: React.FC = () => {
    const [images, setImages] = useState<ImageData[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalData, setModalData] = useState<any>(null);

    const loadImages = async () => {
        try {
            const { data } = await fetchImages();
            const formattedImages: ImageData[] = data.map((image: any) => ({
                id: image.Id,
                repoTag: image.RepoTags?.[0] || "No RepoTag",
            }));
            setImages(formattedImages);
        } catch (err) {
            message.error("Failed to fetch images");
        }
    };

    // Функция для сокращения ID до 8 символов (без префикса "sha256:")
    const shortenId = (id: string): string => {
        const prefix = "sha256:";
        const trimmed = id.startsWith(prefix) ? id.slice(prefix.length) : id;
        return trimmed.slice(0, 8);
    };

    const handleRemove = async (id: string) => {
        try {
            await removeImage(id);
            message.success("Image removed");
            loadImages();
        } catch (err) {
            message.error("Failed to remove image");
        }
    };

    const handleInspect = async (id: string) => {
        try {
            const { data } = await inspectImage(id);
            setModalData(data);
            setIsModalVisible(true);
        } catch (err) {
            message.error("Failed to inspect image");
        }
    };

    useEffect(() => {
        loadImages();
    }, []);

    const columns: ColumnsType<ImageData> = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            render: (id: string) => shortenId(id),
        },
        {
            title: "RepoTag",
            dataIndex: "repoTag",
            key: "repoTag",
            responsive: ['md'] as Breakpoint[],
            render: (text: string, record: ImageData) => (
                <a onClick={() => handleInspect(record.id)} style={{ cursor: "pointer", color: "#1890ff" }}>
                    {text}
                </a>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: ImageData) => (
                <Button danger onClick={() => handleRemove(record.id)}>
                    Delete
                </Button>
            ),
        },
    ];

    return (
        <>
            <Table dataSource={images} columns={columns} rowKey="id" />

            <Modal
                title="Inspect Image"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                {modalData ? (
                    <pre
                        style={{
                            maxHeight: "400px",
                            overflow: "auto",
                            background: "#f5f5f5",
                            padding: "10px",
                        }}
                    >
            {JSON.stringify(modalData, null, 2)}
          </pre>
                ) : (
                    "Loading..."
                )}
            </Modal>
        </>
    );
};

export default Images;
