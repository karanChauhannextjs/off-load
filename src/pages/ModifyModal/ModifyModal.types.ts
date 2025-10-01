import React from "react";

export interface ModifyModalProps {
    data?:any;
    showModifyModal: boolean;
    setShowModifyModal: React.Dispatch<React.SetStateAction<boolean>>;
    setThreeModalsShow?: React.Dispatch<React.SetStateAction<boolean>>;
}