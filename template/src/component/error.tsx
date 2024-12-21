/* eslint-disable @typescript-eslint/no-explicit-any */

export default function ErrorPage({ error, setError } : any) {
    return <>
        {!!error && <div style={{zIndex: 100, position: 'fixed', top: '15%', left: '33%', width: '33%', minHeight : '10%', backgroundColor: 'white', borderTopLeftRadius: '16px', borderTopRightRadius: '16px'}} className="shadow-2xl p-4">
            <h3 style={{color: 'red', textShadow : '2px 2px 4px rgba(150,0,0,0.3)', borderBottom: 'solid rgba(0,0,0,0.3) 1px', paddingBottom: '3px'}}> 
                ERROR!
            </h3>
            <p style={{
                paddingTop: '10px',
                textAlign: 'center',
                fontWeight: 'bolder',
            }}>{error}</p>
            <div style={{width: '100%', display: 'flex', justifyContent:'flex-end', marginTop: '10px'}}>
                <button onClick={() => setError(null)}  style={{color: "green"}}>OK</button>

            </div>
        </div>}
    </>
}