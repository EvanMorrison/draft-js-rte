import React, { useEffect, useState } from "react";
import Style from "./scrollMessage.style";

const ScrollMessage = () => {
  const [message, setMessage] = useState(false);

  useEffect(() => {
    setMessage(true);
  }, [message]);

  const show = message ? "message show" : "message";
  return(
    <Style className={show}>
      <div>Scroll to see all content</div>
    </Style>
  );
};

export default ScrollMessage;