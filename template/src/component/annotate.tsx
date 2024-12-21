/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { projectParamType } from "./projects";
import { urlConstructor } from "../functions";
import {ReactPictureAnnotation} from "react-picture-annotation";
import bg from "./transparent.jpeg";

export type AnnotatePageParam = {
  projectId: { name: string; id: string };
  nextPage: () => void;
  toProjectPage: () => void;
};


type AssetData = {
    image: string;
    project_id: string;
    id: string;
    name: string;
    annotations: Record<string, any>[];
  };

type getAssetResponse = {
  message: string;
  data: AssetData[]
};

export default function AnnotatePage({
  setError,
  logout,
  auth,
  projectId,
  nextPage,
  toProjectPage,
}: projectParamType & AnnotatePageParam) {
  const [currentImage, setCurrentImage] = useState<number>();
  const [assetData, setAssetData] = useState<AssetData[]>();
  const [savingState, setSavingState] = useState<
    "unsaved" | "saving" | "saved" | ''
  >("");
  const [currentAnnotation, setCurrentAnnotation] = useState<Record<string, any>[]>([]);
  const [pageHeight, setPageHeight] = useState((74 * window.innerHeight) / 100);
  const [pageWidth, setPageWidth] = useState((80 * window.innerWidth) / 100);



  useEffect(() => {
    (async()=>{
        try {
            const result = await fetch(
              urlConstructor(`/assets/project/${projectId.id}`),
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${auth}`,
                },
              }
            );

            if (result.status === 401) {
              setError("Your session has expired login to continue");
              logout();
              return;
            }

            if (!result.ok) {
              setError("fetching data error");
              return;
            }

            const data: getAssetResponse = await result.json();

            if (data.data.length > 0) {
              setAssetData(data.data);
            } else {
              nextPage();
            }
            if (currentImage != null) {
              setCurrentAnnotation(
                data.data?.[currentImage].annotations
              );
            }
        } catch (error) {
          console.log(error)
        }
        onResize()
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setError, logout, auth, projectId]);

     const onResize = () => {
      try {
          setPageWidth((80 * window.innerWidth) / 100);
          setPageHeight((74 * window.innerHeight) / 100);
          setTimeout(() => {
            setPageHeight((height) => height + 1);
          }, 500);
      } catch{
        console.log('no resize')
      }

    }

    useEffect(() =>{
      // @ts-ignore
      window.addEventListener("resize", onResize);
      return () => {  window.removeEventListener("resize", onResize)}
    }, []);


    const uploadAnnotation = async(annotation: Record<string, any>, assetData : AssetData | null) => {
      if (assetData != null){
        const annotationString = JSON.stringify(annotation);
        try {
          setSavingState('saving')
          const result = await fetch(urlConstructor("/asset/annotate"), {
            method: "POST",
            body: JSON.stringify({
              asset_id: assetData.id,
              project_id: assetData.project_id,
              annotation: annotationString,
              fresh: true,
            }),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth}`,
            },
          });

          if (!result.ok) {
            return;
          }

          if (result.status === 401) {
            setError("Your session has expired login to continue");
            logout();
            return;
          }

          setSavingState('saved')
        } catch (error) {
          setError(error as string);
          setSavingState("unsaved");
        }
      }
    }


  return (
    <>
      <section
        style={{
          width: "100%",
          height: "90%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <main
          style={{ width: "100%", display: "flex", flexDirection: "column" }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "flex-start",
              marginBottom: "15px",
            }}
          >
            <button
              style={{
                backgroundColor: "blue",
                color: "white",
                paddingBlock: "2px",
              }}
              onClick={toProjectPage}
            >
              <span>Back To Projects</span>
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
              <span style={{ display: "inline" }}>Upload New files</span>
            </button>

            <a style={{ paddingLeft: "30px" }} onClick={() =>uploadAnnotation(currentAnnotation, assetData?.[currentImage!] as AssetData | null)}>
              {savingState== "unsaved" ? <SaveSvg /> : savingState } 
            </a>
          </div>

          <section style={{ width: "100%", minHeight: "400px" }}>
            {
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  width: "100%",
                  height: "480px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "rgba(245,242,237,10)",
                    overflowY: "scroll",
                    height: "100%",
                  }}
                >
                  {assetData &&
                    assetData.map((item, i) => (
                      <div
                        key={item.image}
                        style={{
                          margin: "10px",
                          padding: "10px",
                          backgroundColor: "#abdbe3",
                        }}
                        onClick={() => {
                          if (currentImage != i) {
                            let useInterval = false;
                            if (currentImage != null) {
                              uploadAnnotation(
                                currentAnnotation,
                                assetData?.[currentImage]
                              );
                              const updatedAssetdata = [...assetData];
                              updatedAssetdata[currentImage]["annotations"] =
                                currentAnnotation;
                              setAssetData(updatedAssetdata);
                            } else {
                              useInterval = true;
                            }
                            setCurrentAnnotation(assetData?.[i].annotations);
                            setCurrentImage(i);
                            setSavingState("");
                            if (useInterval) {
                              setTimeout(() => {
                                setPageHeight((height) => height + 1);
                              }, 500);
                            }
                          }
                        }}
                      >
                        <img
                          src={urlConstructor(item.image)}
                          alt={item.name}
                          width={"100px"}
                        />
                        <label style={{ fontSize: "12px", color: "white" }}>
                          {item.name?.split(".")?.[0]}{" "}
                        </label>
                      </div>
                    ))}
                </div>
                <div
                  id={"annotation-page"}
                  style={{
                    backgroundImage: `url(${bg})`,
                    width: "100%",
                    height: "100%",
                  }}
                >
                  {assetData && currentImage != null && (
                    <>
                      <ReactPictureAnnotation
                        key={pageWidth}
                        image={urlConstructor(assetData?.[currentImage]?.image)}
                        onChange={(e) => {
                          setSavingState("unsaved");
                          setCurrentAnnotation(e);
                        }}
                        onSelect={onResize}
                        annotationData={currentAnnotation as any}
                        width={pageWidth}
                        height={pageHeight}
                      />
                    </>
                  )}
                </div>
              </div>
            }
          </section>
        </main>
      </section>
    </>
  );
}


function SaveSvg(){
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width: "20px", height: "20px", marginTop: '3px'}}>
  <g id="SVGRepo_bgCarrier" strokeWidth={0} />
  <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
  <g id="SVGRepo_iconCarrier">
    {'{'}" "{'}'}
    <path fillRule="evenodd" clipRule="evenodd" d="M18.1716 1C18.702 1 19.2107 1.21071 19.5858 1.58579L22.4142 4.41421C22.7893 4.78929 23 5.29799 23 5.82843V20C23 21.6569 21.6569 23 20 23H4C2.34315 23 1 21.6569 1 20V4C1 2.34315 2.34315 1 4 1H18.1716ZM4 3C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21L5 21L5 15C5 13.3431 6.34315 12 8 12L16 12C17.6569 12 19 13.3431 19 15V21H20C20.5523 21 21 20.5523 21 20V6.82843C21 6.29799 20.7893 5.78929 20.4142 5.41421L18.5858 3.58579C18.2107 3.21071 17.702 3 17.1716 3H17V5C17 6.65685 15.6569 8 14 8H10C8.34315 8 7 6.65685 7 5V3H4ZM17 21V15C17 14.4477 16.5523 14 16 14L8 14C7.44772 14 7 14.4477 7 15L7 21L17 21ZM9 3H15V5C15 5.55228 14.5523 6 14 6H10C9.44772 6 9 5.55228 9 5V3Z" fill="#0F0F0F" />{'{'}" "{'}'}
  </g>
</svg>

  );
}