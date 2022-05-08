import { useState } from "react";
import { Folder } from "@mui/icons-material";
import { Button, Menu, MenuItem } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import useSiteConfig from "../../../lib/useSiteConfig";
import useSiteConfigBuffer from "../../../lib/useSiteConfigBuffer";
import FrontmatterDialog from "./FrontmatterDialog";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

function Site() {
  const { siteConfig: initialSiteConfig, isNew } = useSiteConfig();
  const [
    siteConfig,
    {
      editName,
      editCommand,
      editCommandName,
      addNewCommand,
      removeCommand,
      addFrontmatter,
      removeFrontmatter,
      reorderFrontmatter,
      editPath,
      saveSiteConfig,
      removeSiteConfig,
      cancelSiteConfig,
    },
  ] = useSiteConfigBuffer(initialSiteConfig);

  console.log(siteConfig.frontmatter);

  const [isFrontmatterDialogOpen, setIsFrontmatterDialogOpen] = useState(false);
  const closeFrontmatterDialog = () => {
    setIsFrontmatterDialogOpen(false);
  };
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <div id="setting-site">
      {isNew && <h1>New Site</h1>}
      <div className="flex">
        <p>name:</p>
        <input
          onChange={(e) => {
            editName(e.target.value);
          }}
          value={siteConfig.name}
        />
      </div>
      <p>key: {siteConfig.key}</p>
      <div className="flex">
        <p>{siteConfig.path}</p>
        <Button>
          <Folder onClick={editPath} />
        </Button>
      </div>

      <div>
        <p>Commands</p>
        <Button onClick={addNewCommand}>New</Button>
        <div>
          {siteConfig.commands.length !== 0 &&
            siteConfig.commands.map((cmd_obj, i) => (
              <div className="flex">
                <input
                  value={cmd_obj.name}
                  onChange={(e) => editCommandName(e.target.value, i)}
                />
                <input
                  value={cmd_obj.command}
                  onChange={(e) => editCommand(e.target.value, i)}
                />
                <Button onClick={() => removeCommand(i)}>x</Button>
              </div>
            ))}
        </div>
      </div>

      <div>
        <p>frontmatter</p>
        <Button onClick={() => setIsFrontmatterDialogOpen(true)}>New</Button>
        <FrontmatterDialog
          open={isFrontmatterDialogOpen}
          onClose={closeFrontmatterDialog}
          addFrontmatter={addFrontmatter}
        />

        <DragDropContext onDragEnd={reorderFrontmatter}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div
                className="setting-frontmatter-list"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {siteConfig.frontmatter?.map((matter, i) => (
                  <Draggable
                    key={matter.key}
                    draggableId={matter.key}
                    index={i}
                  >
                    {(provided) => (
                      <div
                        className="setting-matter"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{ ...provided.draggableProps.style }}
                      >
                        <p>{matter.key}</p>
                        <p
                          style={{
                            color: "#999",
                            right: "300px",
                            position: "absolute",
                          }}
                        >
                          {matter.type}
                        </p>
                        <MoreHorizIcon
                          onClick={(e) => {
                            setAnchorEl(e.currentTarget);
                            e.stopPropagation();
                          }}
                        />
                        <Menu
                          anchorEl={anchorEl}
                          open={anchorEl !== null}
                          onClose={(e) => {
                            setAnchorEl(null);
                            e.stopPropagation();
                          }}
                          //on Click menuitems
                          onClick={(e) => {
                            setAnchorEl(null);
                            e.stopPropagation();
                          }}
                        >
                          {/*TODO<MenuItem
                            onClick={() => removeFrontmatter(matter.id)}
                          >
                            edit
                          </MenuItem>*/}
                          <MenuItem
                            onClick={() => removeFrontmatter(matter.id)}
                          >
                            delete
                          </MenuItem>
                        </Menu>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <Button onClick={cancelSiteConfig}>Cancel</Button>
      <Button onClick={saveSiteConfig}>Save</Button>
      <Button onClick={() => removeSiteConfig(siteConfig.key)}>Delete</Button>
    </div>
  );
}

export default Site;
