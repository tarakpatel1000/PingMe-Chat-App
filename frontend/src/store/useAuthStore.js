import {create} from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import {io} from "socket.io-client";


const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/"

export const useAuthStore = create((set, get) => ({
    authUser : null,
    isSigningUp : false,
    isLoggingIn : false,
    isUpdatingProfile : false,

    isCheckingAuth : true,
    onlineUsers : [],
    socket : null,

    checkAuth : async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({authUser : res.data})
            get().connectSocket();
        } catch (error) {
            console.log(error);
            set({authUser : null})
        } finally {
            set({isCheckingAuth : false})
        }
    },

    signup : async (data) => {
        set({isSigningUp : true})
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            toast.success("Account created successfully");
            set({authUser : res.data})
            get().connectSocket()
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({isSigningUp : false})
        }
    },

    logout : async () => {
        try {
            await axiosInstance.post("/auth/logout");
            toast.success("Logged out successfully");
            set({authUser : null});
            get().disconnectSocket();            
        } catch (error) {
            toast.error("Something went wrong");
        }
    },

    login : async (formdata) => {
        set({isLoggingIn : true});
        try {
            const res = await axiosInstance.post("/auth/login", formdata)
            set({authUser : res.data});
            toast.success("Logged in successfully");

            get().connectSocket();
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            set({isLoggingIn : false});
        }
    },

    updateProfile : async (data) => {
        set({isUpdatingProfile : true});
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({authUser : res.data});
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error("Not updated something went wrong");
            console.log(error);
        } finally {
            set({isUpdatingProfile : false})
        }
    },

    connectSocket : () => {
        const {authUser} = get();
        if(!authUser || get().socket?.connected) return;
        const socket = io(BASE_URL, {
            query : {
                userId : authUser._id
            }
        });
        socket.connect();   
        set({socket : socket});

        socket.on("getAllOnlineUsers", (data) => {
            set({onlineUsers : data});
        }) // keys received from the backend
    },
    
    disconnectSocket : () => {
        if(get().socket?.connected) {
            get().socket.disconnect();
            set({socket : null});
        }
    },
}))