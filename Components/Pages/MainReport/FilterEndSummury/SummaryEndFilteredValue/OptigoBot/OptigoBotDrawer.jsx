import { Drawer, Box } from "@mui/material";
import "./OptigoBotDrawer.scss";
import ChatWindow from "./ChatWindow";

/**
 * MUI Drawer shell for the OptigoBot block-based chat.
 * Same props ({ open, onClose }) and layout as the previous AskOptigoAiDrawer
 * so it can be swapped in one line. Renders ChatWindow inside.
 */
const OptigoBotDrawer = ({ open, onClose }) => {
  return (
    <Drawer
      anchor="right"
      variant="persistent"
      open={open}
      onClose={onClose}
      className="optigobot-drawer"
      ModalProps={{
        hideBackdrop: true,
        keepMounted: true,
      }}
      sx={{
        "& .MuiDrawer-paper": {
          width: 400,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#f8f9ff",
          borderLeft: "1px solid #e0e0e0",
          boxShadow: "-4px 0 12px rgba(0,0,0,0.05)",
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <ChatWindow onClose={onClose} />
      </Box>
    </Drawer>
  );
};

export default OptigoBotDrawer;
