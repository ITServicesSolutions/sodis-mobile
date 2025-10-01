// hooks/useAuth.ts
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { getUser } from "../store/authSlice";

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem("access_token");
      if (token && !user) {
        await dispatch(getUser());
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  return { user, loading };
};
