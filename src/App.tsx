import React, { useState } from "react";
import { Layout, Menu } from "antd";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Containers from "./pages/Containers";
import Images from "./pages/Images";

const { Header, Content, Footer, Sider } = Layout;

const App: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);

    const toggleSider = () => {
        setCollapsed((prevCollapsed) => !prevCollapsed);
    };

    return (
        <Router>
            <Layout style={{ minHeight: "100vh" }}>
                <Sider
                    breakpoint="lg"
                    collapsedWidth="0"
                    collapsible
                    collapsed={collapsed}
                    onCollapse={(collapse) => setCollapsed(collapse)}
                >
                    <div
                        style={{
                            height: "32px",
                            margin: "16px",
                            background: "rgba(255, 255, 255, 0.3)",
                        }}
                    />
                    <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
                        <Menu.Item key="1">
                            <Link to="/">Dashboard</Link>
                        </Menu.Item>
                        <Menu.Item key="2">
                            <Link to="/containers">Containers</Link>
                        </Menu.Item>
                        <Menu.Item key="3">
                            <Link to="/images">Images</Link>
                        </Menu.Item>
                    </Menu>
                </Sider>
                <Layout>
                    <Header
                        style={{
                            background: "#fff",
                            padding: "0 16px",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        {/* Логотип, по клику на который переключается состояние Sider */}
                        <div
                            className="logo"
                            onClick={toggleSider}
                            style={{
                                cursor: "pointer",
                                fontWeight: "bold",
                                fontSize: "20px",
                            }}
                        >
                            My Logo
                        </div>
                    </Header>
                    <Content style={{ margin: "16px" }}>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/containers" element={<Containers />} />
                            <Route path="/images" element={<Images />} />
                        </Routes>
                    </Content>
                    <Footer style={{ textAlign: "center" }}>
                        Docker Admin ©2025
                    </Footer>
                </Layout>
            </Layout>
        </Router>
    );
};

export default App;
