import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { socket } from "../../configs/socket";
import { SOCKET_DOCUMENT_VERIFICATION_PROGRESS } from "../../redux/actionTypes";

export default function Socket() {
  const dispatch = useDispatch();

  const handleDispatch = (type) => (payload) => {
    for (let item of typeof type === "object" ? type : [type]) {
      dispatch({
        type: item,
        payload,
      });
    }
  };
  useEffect(() => {
    socket.on(
      "documentVerificationUpdate",
      handleDispatch(SOCKET_DOCUMENT_VERIFICATION_PROGRESS)
    );
  }, []);
  return null;
}
