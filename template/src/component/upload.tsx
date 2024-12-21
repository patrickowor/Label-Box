/* eslint-disable @typescript-eslint/no-explicit-any */
import { SetStateAction, useState } from "react";
import { projectParamType } from "./projects";
import { urlConstructor } from "../functions";

export type SubmitResponseStatus = Record<
  string,
  "initial" | "uploading" | "success" | "fail"
>;

export type UploadParam = {
  projectId: { name: string; id: string };
  nextPage: () => void;
  toProjectPage: () => void;
};

export default function Upload({
  setError,
  logout,
  auth,
  projectId,
  nextPage,
  toProjectPage,
}: projectParamType & UploadParam) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [status, setStatus] = useState<
    "initial" | "uploading" | "success" | "fail"
  >("initial");
  const [singlestatus, setSingleStatus] = useState<SubmitResponseStatus>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setStatus("initial");
      setFiles(e.target.files);
      setSingleStatus({} as SetStateAction<SubmitResponseStatus>);

      const statusDict: Record<string, string> = {};
      for (let i = 0; i < e.target.files.length; i++) {
        statusDict[i.toString()] = "initial";
      }

      setSingleStatus(statusDict as SetStateAction<SubmitResponseStatus>);
    }
  };

  const handleUpload = async () => {
    if (files) {
      setStatus("uploading");

      const singlestatusList = [];
      const singlestatusObj: SubmitResponseStatus = {};
      let index = 0;
      for (const file of [...files]) {
        singlestatusObj[index.toString()] = "uploading";
        setSingleStatus(singlestatusObj);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("project_id", projectId.id);

        try {
          const result = await fetch(urlConstructor("/asset/upload"), {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${auth}`,
            },
          });

          if (result.status === 401) {
            setError("Your session has expired login to continue");
            logout();
            return;
          }

          if (!result.ok) {
            setSingleStatus({ ...singlestatus, [index.toString()]: "fail" });
            singlestatusList.push("fail");
          } else {
            singlestatusList.push("success");
            singlestatusObj[index.toString()] = "success";
            setSingleStatus(singlestatusObj);
          }

          await result.json();
        } catch {
          singlestatusList.push("fail");
          singlestatusObj[index.toString()] = "fail";
          setSingleStatus(singlestatusObj);
        }
        index++;
      }

      if (singlestatusList.includes("success")) {
        setStatus("success");
      } else {
        setStatus("fail");
      }
    }
  };

  return (
    <MyDesign name={`Project: ${projectId.name}`}>
      <div className="input-group">
        <input id="file" type="file" multiple onChange={handleFileChange} />
      </div>

      {files && (
        <section
          style={{
            overflowY: "scroll",
            height: "200px",
            marginBlock: "10px",
          }}
        >
          {[...files].map((file, index) => (
            <section key={file.name}>
              File number {index + 1} details:
              <ul>
                <li>Name: {file.name}</li>
                <li>Type: {file.type}</li>
                <li>Size: {file.size} bytes</li>
                <li>Status: {singlestatus[index.toString()]}</li>
              </ul>
            </section>
          ))}
        </section>
      )}

      {files && (
        <button onClick={handleUpload} className="submit">
          Upload {files.length > 1 ? "files" : "a file"}
        </button>
      )}

      <Result status={status} />
      <div style={{ margin: "10px" }}></div>
      <hr />
      <div style={{ marginTop: "10px" }}>
        <button
          style={{
            backgroundColor: "blue",
            color: "white",
            paddingBlock: "2px",
          }}
          onClick={toProjectPage}
        >
          Projects
        </button>
        <button
          style={{
            backgroundColor: "blue",
            color: "white",
            marginLeft: "10px",
            paddingBlock: "2px",
          }}
          onClick={nextPage}
        >
          Annotate
        </button>
      </div>
    </MyDesign>
  );
}

const Result = ({ status }: { status: string }) => {
  if (status === "success") {
    return <p>✅ File uploaded successfully!</p>;
  } else if (status === "fail") {
    return <p>❌ File upload failed!</p>;
  } else if (status === "uploading") {
    return <p>⏳ Uploading selected file...</p>;
  } else {
    return null;
  }
}; 


function MyDesign({ children, name }: any) {
  return (
    <>
      <section
        style={{
          width: "100%",
          height: "80%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          className="min-h-screen py-6 flex flex-col justify-center sm:py-12"
          style={{ marginTop: "20px" }}
        >
          <div className="relative py-3 sm:max-w-xl sm:mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-sky-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
            <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
              <div className="max-w-md mx-auto">
                <div
                  style={{
                    paddingBottom: "10px",
                    minWidth: "250px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <h1 className="text-2xl font-semibold">{name ?? ''}</h1>
                </div>
                <div style={{margin: '10px',width: '50%', marginLeft: '0px'}}>
                  <label style={{ textAlign: 'center'}} >upload your images</label>
                </div>
                <div>
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}