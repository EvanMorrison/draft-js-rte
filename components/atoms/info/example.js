import Info from "./";
import React from "react";

const InfoExample = ({info}) => (
  <Info info={info || "info to display"}/>
);

export default InfoExample;
