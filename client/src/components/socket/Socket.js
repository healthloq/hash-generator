import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { socket } from "../../configs/socket";
import { SOCKET_DOCUMENT_VERIFICATION_PROGRESS,SOCKET_DOCUMENT_VERIFICATION_RESULT } from "../../redux/actionTypes";

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
    socket.on("documentVerificationResult",handleDispatch(SOCKET_DOCUMENT_VERIFICATION_RESULT))
  }, []);
  return null;
}
