
import { CSSProperties } from "react";


export type headerTypes = {
    isAuthenticated?: boolean;
    logout: () => void;
}

export default function Header({ isAuthenticated = false, logout} : headerTypes) {
    const style: CSSProperties = {};

    return (<header style={{ display : "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: '2px', paddingTop: '2px'}}>
        <div style={{fontStyle: 'oblique', fontWeight: 'bolder', fontSize: '25px'}}>LABEL BOX</div>
        { isAuthenticated ? <a onClick={logout} style={style}>Logout</a> : <a style={style} >About Us</a>}
        
    </header>)
}