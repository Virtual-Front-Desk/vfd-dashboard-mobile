import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const loginUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    const { data } = await axios.post(process.env.EXPO_PUBLIC_API_URL + "/user/login", {
      email,
      password,
    });

    return data;
  } catch (error: any) {
    return error.response.data;
  }
};

export const getMe = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    const { data } = await axios.get(process.env.EXPO_PUBLIC_API_URL + "/user", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  } catch (error: any) {

    return error.response.data;
  }
};