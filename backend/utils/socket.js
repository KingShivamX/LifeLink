let socketInstance = null

export const setSocketServerInstance = (io) => {
    socketInstance = io
}

export const emitSocketEvent = (event, payload) => {
    if (socketInstance && event) {
        socketInstance.emit(event, payload)
    }
}

export const getSocketServerInstance = () => socketInstance

