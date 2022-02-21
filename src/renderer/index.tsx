import React, { useState, SyntheticEvent } from "react";
import { render } from "react-dom";
import { StyledEngineProvider } from '@mui/material/styles';
import EditorPanel from "./components/EditorPanel";
import CustomMenu from "./components/Menu";

const root = document.createElement("div");

root.id = "root";
document.body.appendChild(root);

function App() {
  
  const [value, setValue] = useState(0);
  
  const [tabContent, setAddTabContent] = useState<any>([{
    key:0,
    id:0,
    data:"datadog",
    path:"sample",
    filename:"untitled",
    ext:""
  }]);

  const handleTabChange = (event: SyntheticEvent<Element, Event>, newTabId: number) => {
    if (newTabId === -1) {
      addTab();
    } else {
      setValue(newTabId);
    }
  };

  const editHandler = (data:string) => {
    let newTabContent = [...tabContent];
    newTabContent.forEach(ntc => {
      if (ntc.id === value) {
        ntc.data = data;
      }
    });
    setAddTabContent(newTabContent);
  }

  const addTab = (
    data:string="empty file", 
    path:string="untitled", 
    filename:string="untitled",
    ext:string=""
  ) => {
    const id = tabContent[tabContent.length-1].id + 1;
    setAddTabContent([
      ...tabContent, 
      {
        key:id, 
        id:id, 
        data:data, 
        path:path, 
        filename:filename,
        ext:ext
      }
    ]);
  };

  return(
    <StyledEngineProvider injectFirst>
      <CustomMenu openFileEvent={addTab}/>
      <EditorPanel 
        content={tabContent} 
        value={value} 
        changeHandler={handleTabChange}
        editHandler={editHandler}/>
    </StyledEngineProvider>
  );

}

render(
    <App/>,
    document.getElementById("root")
);
