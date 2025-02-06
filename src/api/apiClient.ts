import axios from "axios";

const apiClientContainer = axios.create({
    baseURL: "/api/docker/container/local",
    headers: {
        "Content-Type": "application/json",
    },
});

// const apiClientClient = axios.create({
//     baseURL: "/api/docker/client/local",
//     headers: {
//         "Content-Type": "application/json",
//     },
// });

const apiClientImage = axios.create({
    baseURL: "/api/docker/image/local",
    headers: {
        "Content-Type": "application/json",
    },
});

export const fetchContainers = (all: boolean) =>
    apiClientContainer.get(`/listOfContainers?all=${all}`);

export const fetchImages = () => apiClientImage.get("/listOfImages");

export const inspectImage = (id: string) =>
    apiClientImage.get(`/inspectImage?id=${id}`);

export const startContainer = (id: string) =>
    apiClientContainer.post(`/startContainer?id=${id}`);

export const removeContainer = (id: string, force: boolean) =>
    apiClientContainer.delete(`/removeContainer?id=${id}&force=${force}`);

export const removeImage = (id: string) =>
    apiClientImage.delete(`/removeImage?id=${id}`);

export const stopContainer = (id: string) =>
    apiClientContainer.post(`/stopContainer?id=${id}`);

export const restartContainer = (id: string) =>
    apiClientContainer.post(`/restartContainer?id=${id}`);

export const killContainer = (id: string) =>
    apiClientContainer.delete(`/killContainer?id=${id}`);

export const renameContainer = (id: string, name: string) =>
    apiClientContainer.post(`/renameContainer?id=${id}&name=${name}`);

export const inspectContainer = (id: string) =>
    apiClientContainer.get(`/inspectContainer?id=${id}`);

export const diffContainer = (id: string) =>
    apiClientContainer.get(`/diffContainer?id=${id}`);

export const statsContainer = (id: string) =>
    apiClientContainer.get(`/stats?id=${id}`, { responseType: "stream" });

export const createContainer = (data: any) =>
    apiClientContainer.post(`/createContainer`, data);

export const topContainer = (id: string) =>
    apiClientContainer.get(`/topContainer?id=${id}`);