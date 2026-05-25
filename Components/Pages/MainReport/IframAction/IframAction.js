import { Button, Dialog, IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { MessageCircle, NotebookPen, Printer, X } from "lucide-react";

const IframAction = ({ params, col, iframeModelData }) => {
  const [iframeTitle, setIframeTitle] = useState();
  const [iframeUrl, setIframeUrl] = useState("");
  const [openHrefModel, setOpenHrefModel] = useState(false);


  const buildIframeUrl = (params, colId, iframeTypeId) => {
    const row = params?.row || {};
    const rd1Item = iframeModelData?.rd1?.find(
      (x) => x.ColId == colId && x.IframeTypeId == iframeTypeId
    );
    const rdParams = iframeModelData?.rd?.filter(
      (x) => x.ColId == colId && x.IframeTypeId == iframeTypeId
    );
    if (!rd1Item || !rdParams) return "";
    const getRowValue = (paramName) => {
      const key = Object.keys(row).find(
        (k) => k.toLowerCase() === paramName.toLowerCase()
      );
      return key ? row[key] : "";
    };
    const queryString = rdParams
      .map((p) => {
        if (p.IsStatic === true || p.IsStatic === "true") {
          return `${p.ParameterName}=${encodeURIComponent(p.ParameterValue)}`;
        } else {
          return `${p.ParameterName}=${encodeURIComponent(
            getRowValue(p.ParameterName) || ""
          )}`;
        }
      })
      .join("&");

    return `${rd1Item.BaseUrl}${rd1Item.ReportRedirectUrl}&${queryString}`;
  };

  const waitForIframeData = async () => {
    let retries = 10; // retry max 10 times
    let delay = 300; // 300ms interval
    while (retries > 0) {
      if (iframeModelData && iframeModelData.rd1 && iframeModelData.rd) {
        return iframeModelData; // data ready
      }
      await new Promise((res) => setTimeout(res, delay)); // wait
      retries--;
    }

    return null; // still no data
  };

  const openIframe = async (params, columId, iframeTypeId) => {
    const data = await waitForIframeData();
    if (!data) {
      console.warn("iframeModelData not loaded even after waiting");
      return;
    }

    const rdParams = iframeModelData?.rd1?.filter(
      (x) => x.ColId == columId && x.IframeTypeId == iframeTypeId
    );
    setIframeTitle(rdParams[0]?.PopupTitle);
    const url = buildIframeUrl(params, columId, iframeTypeId);
    setIframeUrl(url);
    setOpenHrefModel(true);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <Button
        onClick={() =>
          openIframe(
            params,
            params?.colDef?.ColId,
            params?.colDef?.IframeTypeId
          )
        }
        style={{
          padding: "0px",
          fontSize: "12px",
          color: "black",
          textDecoration: "underline",
        }}
      >
        {
          col?.IconName == "NotebookPen" ? (
            <NotebookPen style={{ color: "gray" }} />
          ) : col?.IconName == "Printer" ? (
            <Printer style={{ color: "gray" }} />
          ) : col?.IconName == "MessageCircle" ? (
            <MessageCircle style={{ color: "gray" }} />
          ) : col?.IframeColumnLable ? (
            params?.value != "" ? params?.value : col?.IframeColumnLable
          ) :
            params?.value
        }
      </Button>

      <Dialog
        open={openHrefModel}
        onClose={() => setOpenHrefModel(false)}
        PaperProps={{
          sx: {
            height: "40vh",
            borderRadius: 2,
            overflow: "hidden",
            width: "600px",
          },
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "15px 15px 10px 15px",
            backgroundColor: "#ebebeb",
          }}
        >
          <div>
            <p>{iframeTitle}</p>
          </div>
          <IconButton
            edge="end"
            size="small"
            onClick={() => setOpenHrefModel(false)}
            aria-label="clear"
            style={{ border: "1px solid rgb(44 56 90)" }}
          >
            <X size={18} color="black" />
          </IconButton>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "10px 20px",
            height: "100%",
          }}
        >
          <iframe
            src={iframeUrl}
            title="iframe-preview"
            style={{
              border: "none",
              height: "100%",
            }}
          />
        </div>
      </Dialog>
    </div>
  );
};

export default IframAction;