import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/message/users");
      set({ users: res.data });
    } catch (error) {
      toast.error("Failed to fetch users");
      console.log(error);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages : async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error("Failed to fetch messages");
      console.log(error);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage : async (data) => {
    try {
        const { selectedUser, messages } = get();
        const res = await axiosInstance.post(`/message/send/${selectedUser._id}`, data);
        set({messages : [...messages, res.data]});
    } catch (error) {
        toast.error("Failed to send message");
        console.log(error);
    }
  },

  listenToMessages : () => {
    const { selectedUser} = get();
    if(!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    
    socket.on("newMessage", (message) => {
      const isMessageSentFromSelectedUser = message.senderId === selectedUser._id;
      if(!isMessageSentFromSelectedUser) return;
      set({messages : [...get().messages, message]});
    })
  },

  dontListenToMessages : () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

 
  setSelectedUser : (selectedUser) => {
    set({selectedUser});
  }
}));
