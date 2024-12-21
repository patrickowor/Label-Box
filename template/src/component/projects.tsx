import { CSSProperties, useEffect, useState } from "react";
import { urlConstructor } from "../functions";
import Upload from "./upload";
import AnnotatePage from "./annotate";

export type projectParamType = {
  auth: string | null;
  setError: (arg: string) => void;
  logout: () => void;
};

type projectType = {
    id: string;
    project_name: string;
    user_id: string;
} 

export default function Project({ auth, setError, logout }: projectParamType) {
  const [data, setData] = useState<projectType[] | null>(null);
  const [update, setupdateFetch] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [newProject, setNewProject] = useState<string>();
  const [selectedProject, setselectedProject] = useState<{ name: string, id: string}>();
  const [nextPage, setnextPage] = useState<"upload" | "annotate">("annotate");


  const projectDeleteBtnHoveredStyle: CSSProperties = {
    marginTop: "4px",
    fontSize: "12px",
    width: '24px',
    color: "red",
    visibility: "visible",
  };

const updateDataFetch = () => {
    setupdateFetch(Math.floor(Math.random() * 100));
};

  useEffect(() => {
    (async () => {
      try {
        if (auth == null) return;
        const response = await fetch(urlConstructor("/project"), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth}`,
          },
        });

        if (response.status === 401) {
          setError("Your session has expired login to continue");
          logout();
          return;
        }

        if (!response.ok) {
          setError(`requst failed with a status ${response.status}`);
          return;
        }

        const data = await response.json();

        setData(data.data as projectType[]);
      } catch (error) {
        setError((error as Error).toString());
      }
    })();
  }, [auth, update, setError, logout]);


  const deleteProject = async (id: string) => {
    try {
         const response = await fetch(urlConstructor(`/project/${id}`), {
           method: "DELETE",
           headers: {
             "Content-Type": "application/json",
             Authorization: `Bearer ${auth}`,
           },
         });

         if (response.status === 401) {
           setError("Your session has expired login to continue");
           logout();
           return;
         }

         if (!response.ok) {
           setError(`requst failed with a status ${response.status}`);
           return;
         }   

        updateDataFetch();
    } catch (error) {
        setError((error as Error).toString());
    }

  }

    const createProject = async () => {
      if (newProject == null || newProject == '') setError('project name is empty');
      try {
        const response = await fetch(urlConstructor(`/project`), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth}`,
          },
          body: JSON.stringify({
            name: newProject,
          }),
        });

        if (response.status === 401) {
          setError("Your session has expired login to continue");
          logout();
          return;
        }

        if (!response.ok) {
          setError(`requst failed with a status ${response.status}`);
          return;
        }
        setShowCreate(false);
        setNewProject('');
        updateDataFetch();
      } catch (error) {
        setError((error as Error).toString());
      }
    };

  return (
    <>
      {!selectedProject ? (
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
                    <h1 className="text-2xl font-semibold">Projects</h1>

                    <button
                      style={{ paddingBlock: "3px" }}
                      onClick={() => setShowCreate(!showCreate)}
                    >
                      {showCreate ? "X" : "+"}
                    </button>
                  </div>

                  <hr />
                  {showCreate && (
                    <div className="flex mt-5" style={{ position: "relative" }}>
                      <label
                        htmlFor="project"
                        className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm "
                      >
                        Create project
                      </label>
                      <input
                        type="text"
                        autoComplete="off"
                        id="project"
                        name="project"
                        className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:borer-rose-600"
                        placeholder="Project Name"
                        value={newProject}
                        onChange={(e) => setNewProject(e.target.value)}
                      />
                      <button
                        style={{ paddingBlock: "3px", marginLeft: "10px" }}
                        onClick={createProject}
                      >
                        submit
                      </button>
                    </div>
                  )}
                </div>
                <div className="divide-y divide-gray-200">
                  <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                    {!!data &&
                      data?.map((item: projectType, i: number) => {
                        return (
                          <div
                            key={item.id}
                            style={{ display: "flex" }}
                            // onMouseOver={() => {
                            //   setHoveringOn(i);
                            // }}
                            // onMouseOut={() => {
                            //   setHoveringOn(null);
                            // }}
                          >
                            <a
                              style={{
                                padding: "3px",
                                minWidth: "250px",
                                display: "flex",
                                justifyContent: "flex-start",
                              }}
                              onClick={() =>
                                setselectedProject({
                                  name: item.project_name,
                                  id: item.id,
                                })
                              }
                            >
                              <span style={{ fontSize: "12px", color: "blue" }}>
                                {i + 1} {')'}
                              </span>
                              <span style={{ paddingInline: "2px" }}></span>
                              <span style={{ fontSize: "12px" }}>
                                {item.project_name}
                              </span>
                            </a>
                            <span
                              style={{...projectDeleteBtnHoveredStyle, outline: 'none'}}
                              
                              onClick={() => deleteProject(item.id)}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                stroke="#ff0000"
                              >
                                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                <g
                                  id="SVGRepo_tracerCarrier"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></g>
                                <g id="SVGRepo_iconCarrier">
                                  {" "}
                                  <path
                                    d="M6 5H18M9 5V5C10.5769 3.16026 13.4231 3.16026 15 5V5M9 20H15C16.1046 20 17 19.1046 17 18V9C17 8.44772 16.5523 8 16 8H8C7.44772 8 7 8.44772 7 9V18C7 19.1046 7.89543 20 9 20Z"
                                    stroke="#ff0000"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  ></path>{" "}
                                </g>
                              </svg>
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : nextPage == "upload" ? (
        <Upload
          logout={logout}
          auth={auth}
          setError={setError}
          projectId={selectedProject}
          toProjectPage={() => setselectedProject(undefined)}
          nextPage={() => setnextPage("annotate")}
        />
      ) : (
        <AnnotatePage
          logout={logout}
          auth={auth}
          setError={setError}
          projectId={selectedProject}
          toProjectPage={() => setselectedProject(undefined)}
          nextPage={() => setnextPage("upload")}
        />
      )}
    </>
  );
}