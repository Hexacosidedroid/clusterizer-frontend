import {
    encodeCompositeMetadata,
    encodeRoute,
    MESSAGE_RSOCKET_ROUTING,
    RSocketClient,
} from "rsocket-core";
import RSocketWebSocketClient from "rsocket-websocket-client";
import {Flowable} from "rsocket-flowable";

const rsocketClient = new RSocketClient({
    setup: {
        keepAlive: 60000,
        lifetime: 180000,
        dataMimeType: "application/json",
        metadataMimeType: "message/x.rsocket.composite-metadata.v0",
    },
    transport: new RSocketWebSocketClient({
        url: "/rsocket",
        wsCreator: (url) => new WebSocket(url) as any,
    }),
});

const connectionPromise: Promise<any> = new Promise((resolve, reject) => {
    rsocketClient.connect().subscribe({
        onComplete: (socket: any) => {
            resolve(socket);
        },
        onError: (error: any) => {
            console.error(error);
            reject(error);
        },
        onSubscribe: (cancel: any) => {
            console.log("Подписка на соединение:", cancel);
        },
    });
});

function requestStream<T>(route: string, data: string): Flowable<T> {
    return new Flowable<T>((subscriber) => {
        connectionPromise.then((socket) => {
            const metadata = encodeCompositeMetadata([[MESSAGE_RSOCKET_ROUTING, encodeRoute(route)]]);
            socket
                .requestStream({
                    data,
                    metadata,
                })
                .subscribe({
                    onSubscribe: (subscription: any) => {
                        subscription.request(1);
                    },
                    onNext: (payload: any) => {
                        subscriber.onNext(payload.data);
                    },
                    onError: (error: any) => {
                        console.error(error);
                        subscriber.onError(error);
                    },
                    onComplete: () => subscriber.onComplete(),
                });
        });
    });
}

export function pullImage(configId: string, request: any): Flowable<any> {
    const route = `docker.image.${configId}.pullImage`;
    return requestStream(route, JSON.stringify(request));
}

export function logContainer(
    configId: string,
    request: { id: string; follow: boolean; tail?: number }
): Flowable<any> {
    const route = `docker.client.${configId}.logContainer`;

    return requestStream(route, JSON.stringify(request));
}
