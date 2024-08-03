import React, { useEffect, useState, useRef, createContext } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";

const socket = io("http://localhost:5000");


const SocketContext = createContext();

const ContextProvider = ({ children }) => {
    const [stream, setstream] = useState(null);
    const [me, setme] = useState('');
    const [call, setcall] = useState({})
    const myVideo = useRef(null);
    const userVideo = useRef(null);
    const connectionRef = useRef();
    const [callAccepted, setcallAccepted] = useState(false);
    const [callEnded, setcallEnded] = useState(false);
    const [name, setname] = useState('');

    useEffect(() => {
        const getData = async () => {
            const constraints = { video: true, audio: true };

            navigator.mediaDevices.getUserMedia(constraints)
                .then((currentStream) => {
                    setstream(currentStream);
                })
                .catch((error) => {
                    console.error("Error accessing media devices:", error);
                });
            socket.on('me', (id) => setme(id))

            socket.on('calluser', ({ from, name: callerName, signal }) => {
                setcall({ isReceivedCall: true, from, name: callerName, signal })
            })
        }

        getData();

    }, [])
    useEffect(() => {
        const constraints = { video: true, audio: true };
        navigator.mediaDevices.getUserMedia(constraints)
            .then((currentStream) => {
                if (myVideo.current) {
                    myVideo.current.srcObject = currentStream;
                }
            })
            .catch((error) => {
                console.error("Error accessing media devices:", error);
            });

    }, [stream]);

    const answerCall = () => {
        { console.log("stream", stream) }
        if (!stream) {
            console.error("Stream is not available");
            return;
        }

        setcallAccepted(true);
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream
        })

        peer.on('signal', (data) => {
            socket.emit('answercall', { signal: data, to: call.from })
        })

        peer.on('stream', (currentStream) => {
            userVideo.current.srcObject = currentStream;
        })

        peer.signal(call.signal);

        connectionRef.current = peer;
    }

    const callUser = (id) => {
        { console.log("stream: ", stream) }
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream
        })

        peer.on('signal', (data) => {
            socket.emit('calluser', { userToCall: id, signalData: data, from: me, name })
        })

        peer.on('stream', (currentStream) => {
            userVideo.current.srcObject = currentStream;
        })

        socket.on('callaccepted', (signal) => {
            setcallAccepted(true);
            peer.signal(signal);
        })

        connectionRef.current = peer;
    }

    const leaveCall = () => {
        setcallEnded(true);
        connectionRef.current.destroy();
        window.location.reload();
    }

    return (
        <SocketContext.Provider value={{
            call, callAccepted, myVideo, userVideo, stream, name, setname, callEnded, me, callUser, leaveCall, answerCall
        }}>
            {children}
        </SocketContext.Provider>
    )
}

export { SocketContext, ContextProvider };