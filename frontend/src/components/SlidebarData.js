import React from "react";

import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";

export const SidebarData = [
  {
    title: "Home",
    path: "/",
    icon: <AiIcons.AiFillHome />,
    cName: "nav-text"
  },
  {
    title: "Account",
    path: "/Account",
    icon: <IoIcons.IoIosPaper />,
    cName: "nav-text"
  },
  {
    title: "About",
    path: "/About",
    icon: <FaIcons.FaInfoCircle />,
    cName: "nav-text"
  },
];
