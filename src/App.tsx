import { useEffect, useState } from "react";
import { Request } from "./components/Requests"
import { useNavigate } from "react-router-dom";
import { RecentUsers } from "./components/RecentUsers";
import { useRecoilState } from "recoil";
import { userAtom } from "./features/atoms";
import { db } from "./firebase";
import { DocumentData, deleteDoc, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { Header } from "./components/Header";
import "./App.css";

const linearGradient = (x1: number[], x2: number[], y1: number[], y2: number[], duration: number) => {
  return <>
    <animate
      attributeName="x1"
      values={x1.join(";")}
      dur={`${duration}s`}
      repeatCount="indefinite"
    />
    <animate
      attributeName="x2"
      values={x2.join(";")}
      dur={`${duration}s`}
      repeatCount="indefinite"
    />
    <animate
      attributeName="y1"
      values={y1.join(";")}
      dur={`${duration}s`}
      repeatCount="indefinite"
    />
    <animate
      attributeName="y2"
      values={y2.join(";")}
      dur={`${duration}s`}
      repeatCount="indefinite"
    />
  </>
};

export function App({ user }: { user: { displayName: string, uid: string } }) {
  const [req, setReq] = useState<DocumentData | null>(null);
  const [recentUsers, setRecentUsers] = useState<DocumentData[] | null>(null);

  useEffect(() => {
    getDoc(doc(db, user.uid, "users")).then((doc) => {
      if (doc.exists()) {
        const map = doc.data();
        for (const key in map) {
          setRecentUsers(prev => {
            if (prev == null) return [{ displayName: map[key][0], uid: key }];
            return [...prev, { displayName: map[key][0], uid: key }];
          });
        }
      }
    });

    return () => {
      setRecentUsers(null);
    }
  }, [])

  useEffect(() => {
    if (req) return;

    const docRef = doc(db, user.uid, "request");
    deleteDoc(docRef);
    const unsubscribe = onSnapshot(docRef, async snapshot => {
      const data = snapshot.data();
      if (data && !data.waiting) {
        unsubscribe();
        await updateDoc(docRef, { waiting: true });
        await deleteDoc(doc(db, user.uid, "offer"));
        await deleteDoc(doc(db, user.uid, "answer"));
        await deleteDoc(doc(db, user.uid, "candidate"));
        setReq({
          displayName: data.displayName,
          uid: data.uid,
          status: data.status
        });
      }
    });

    return () => {
      unsubscribe();
    }
  }, [req])


  const handleReqReject = () => {
    setReq(null);
    updateDoc(doc(db, user.uid, "request"), { status: false });
  }

  const handleCode = () => {
    navigator.clipboard.writeText(user.uid);
  }


  return (
    <main>
      {
        // Handeling sharing request if any and if sharing screen then showing whom to sharing screen with
        req && (req.status != true ?
          <Request ownUID={user.uid} name={req.displayName} reqUID={req.uid} rejectReq={handleReqReject} />
          : <h1>Sharing Screen with {req.displayName}</h1>)
      }

      <Header displayName={user.displayName} />

      <div className="code_header">
        {/* Users code which will be used to share screen */}
        <h1 className="code" onClick={handleCode}>{user.uid.slice(0, 3) + "-" + user.uid.slice(3)}</h1>
      </div>

      {/* Previously shared screen with if any */}
      {recentUsers && <RecentUsers name={user.displayName} uid={user.uid} users={recentUsers} />}

      {/* Background Animted SVG */}
      <svg className="main_bg" fill="none" height="264" viewBox="0 0 891 264" width="891">
        <path d="M388 96L388 68C388 65.7909 386.209 64 384 64L310 64" stroke="#fff"
          strokeOpacity="0.1" pathLength="1" strokeDashoffset="0px" strokeDasharray="1px 1px"></path>
        <path d="M349 150L73 150C70.7909 150 69 151.791 69 154L69 174" stroke="#fff"
          strokeOpacity="0.1" pathLength="1" strokeDashoffset="0px" strokeDasharray="1px 1px"></path>
        <g>
          <path d="M547 130L822 130C824.209 130 826 131.791 826 134L826 264"
            stroke="#fff" strokeOpacity="0.1" pathLength="1" strokeDashoffset="0px" strokeDasharray="1px 1px"></path>
          <path d="M547 130L822 130C824.209 130 826 131.791 826 134L826 264" stroke="url(#orange-pulse-1)" strokeWidth="2"></path>
        </g>
        <g>
          <path d="M349 130L5.00002 130C2.79088 130 1.00001 131.791 1.00001 134L1.00001 264"
            stroke="#fff" strokeOpacity="0.1" pathLength="1" strokeDashoffset="0px" strokeDasharray="1px 1px"></path>
          <path d="M349 130L5.00002 130C2.79088 130 1.00001 131.791 1.00001 134L1.00001 264"
            stroke="url(#blue-pulse-1)" strokeLinecap="round" strokeWidth="2"></path>
        </g>
        <g>
          <path d="M547 150L633 150C635.209 150 637 151.791 637 154L637 236C637 238.209 635.209 240 633 240L488 240C485.791 240 484 241.791 484 244L484 264"
            stroke="#fff" strokeOpacity="0.1" pathLength="1" strokeDashoffset="0px" strokeDasharray="1px 1px"></path>
          <path d="M547 150L633 150C635.209 150 637 151.791 637 154L637 236C637 238.209 635.209 240 633 240L488 240C485.791 240 484 241.791 484 244L484 264"
            stroke="url(#pink-pulse-2)" strokeLinecap="round" strokeWidth="2"></path>
        </g>
        <g>
          <path d="M388 184L388 194C388 196.209 386.209 198 384 198L77 198C74.7909 198 73 199.791 73 202L73 264"
            stroke="#fff" strokeOpacity="0.1" pathLength="1" strokeDashoffset="0px" strokeDasharray="1px 1px"></path>
          <path d="M388 184L388 194C388 196.209 386.209 198 384 198L77 198C74.7909 198 73 199.791 73 202L73 264"
            stroke="url(#blue-pulse-2)" strokeLinecap="round" strokeWidth="2"></path>
        </g>

        <path d="M412 96L412 0" stroke="url(#paint0_linear_341_27683)" strokeOpacity="0.1"
          pathLength="1" strokeDashoffset="0px" strokeDasharray="1px 1px"></path>
        <g>
          <path d="M412 263.5L412 184" stroke="#fff" strokeOpacity="0.1" pathLength="1"
            strokeDashoffset="0px" strokeDasharray="1px 1px" transform-origin="412px 223.75px"
            style={{ transform: "scale(-1)", transformOrigin: " 412px 223.75px" }}></path>
          <path d="M412 263.5L412 184" stroke="url(#pink-pulse-1)" strokeLinecap="round" strokeWidth="2"></path>
        </g>

        <g>
          <path d="M508 96L508 88C508 85.7909 509.791 84 512 84L886 84C888.209 84 890 85.7909 890 88L890 264"
            stroke="#fff" strokeOpacity="0.1" pathLength="1" strokeDashoffset="0px" strokeDasharray="1px 1px"></path>
          <path d="M508 96L508 88C508 85.7909 509.791 84 512 84L886 84C888.209 84 890 85.7909 890 88L890 264"
            stroke="url(#orange-pulse-2)" strokeWidth="2"></path>
        </g>

        <path d="M436 96L436 0" stroke="url(#paint1_linear_341_27683)" strokeOpacity="0.1"
          pathLength="1" strokeDashoffset="0px" strokeDasharray="1px 1px"></path>

        <path d="M436 214L436 184" stroke="#fff" strokeOpacity="0.1" pathLength="1" strokeDashoffset="0px" strokeDasharray="1px 1px" transform-origin="436px 199px"
          style={{ transform: "scale(-1)", transformOrigin: " 436px 199px" }}></path>

        <path d="M460 96L460 64" stroke="#fff" strokeOpacity="0.1" pathLength="1" strokeDashoffset="0px" strokeDasharray="1px 1px"></path>

        <path d="M460 239L460 184" stroke="#fff" strokeOpacity="0.1" pathLength="1" strokeDashoffset="0px" strokeDasharray="1px 1px"
          transform-origin="460px 211.5px" style={{ transform: "scale(-1)", transformOrigin: "460px 211.5px" }}></path>

        <path d="M484 96L484 24C484 21.7909 485.791 20 488 20L554 20"
          stroke="url(#paint2_linear_341_27683)" strokeOpacity="0.1" pathLength="1" strokeDashoffset="0px" strokeDasharray="1px 1px"></path>

        <path d="M484 184L484 210C484 212.209 485.791 214 488 214L560 214"
          stroke="#fff" strokeOpacity="0.1" pathLength="1" strokeDashoffset="0px" strokeDasharray="1px 1px"></path>

        <path d="M508 184L508 193C508 195.209 509.791 197 512 197L560 197"
          stroke="#fff" strokeOpacity="0.1" pathLength="1" strokeDashoffset="0px" strokeDasharray="1px 1px"></path>

        <circle cx="460" cy="64" fill="rgb(0,0,0)" r="4" opacity="1"></circle>
        <circle cx="460" cy="64" r="3.5" stroke="#fff" strokeOpacity="0.1" opacity="1"></circle>
        <circle cx="308" cy="64" fill="rgb(0,0,0)" r="4" opacity="1"></circle>
        <circle cx="308" cy="64" r="3.5" stroke="#fff" strokeOpacity="0.1" opacity="1"></circle>
        <circle cx="69" cy="173" fill="rgb(0,0,0)" r="4" opacity="1"></circle>
        <circle cx="69" cy="173" r="3.5" stroke="#fff" strokeOpacity="0.1" opacity="1"></circle>
        <circle cx="436" cy="214" fill="rgb(0,0,0)" r="4" opacity="1"></circle>
        <circle cx="436" cy="214" r="3.5" stroke="#fff" strokeOpacity="0.1" opacity="1"></circle>
        <circle cx="460" cy="240" fill="rgb(0,0,0)" r="4" opacity="1"></circle>
        <circle cx="460" cy="240" r="3.5" stroke="#fff" strokeOpacity="0.1" opacity="1"></circle>
        <circle cx="560" cy="214" fill="rgb(0,0,0)" r="4" opacity="1"></circle>
        <circle cx="560" cy="214" r="3.5" stroke="#fff" strokeOpacity="0.1" opacity="1"></circle>
        <circle cx="560" cy="197" fill="rgb(0,0,0)" r="4" opacity="1"></circle>
        <circle cx="560" cy="197" r="3.5" stroke="#fff" strokeOpacity="0.1" opacity="1"></circle>

        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="blue-pulse-1" x1={83} x2={83} y1={320} y2={415} >
            <stop stopColor="#2EB9DF" stopOpacity="0"></stop>
            <stop offset="0.05" stopColor="#2EB9DF"></stop>
            <stop offset="1" stopColor="#2EB9DF" stopOpacity="0"></stop>
            {linearGradient([83, 400], [83, 350], [320, 83], [415, 133.75], 2.2)}
          </linearGradient>


          <linearGradient gradientUnits="userSpaceOnUse" id="blue-pulse-2" x1={83} x2={83} y1={267.5} y2={300}>
            <stop stopColor="#2EB9DF" stopOpacity="0"></stop>
            <stop offset="0.05" stopColor="#2EB9DF"></stop>
            <stop offset="1" stopColor="#2EB9DF" stopOpacity="0"></stop>
            {linearGradient([83, 400], [83, 350], [267.5, 83], [300, 133.75], 2)}
          </linearGradient>


          <linearGradient gradientUnits="userSpaceOnUse" id="pink-pulse-1" x1={412} x2={412} y1={264} y2={304}>
            <stop stopColor="#FF4A81" stopOpacity="0"></stop>
            <stop offset="0.030" stopColor="#FF4A81"></stop>
            <stop offset="0.27" stopColor="#DF6CF6"></stop>
            <stop offset="1" stopColor="#0196FF" stopOpacity="0"></stop>
            {linearGradient([412, 400], [412, 350], [264, 83], [304, 133.75], 0.9)}
          </linearGradient>


          <linearGradient gradientUnits="userSpaceOnUse" id="pink-pulse-2" x1={490} x2={490} y1={266} y2={284}>
            <stop stopColor="#FF4A81" stopOpacity="0"></stop>
            <stop offset="0.0564843" stopColor="#FF4A81"></stop>
            <stop offset="0.4616" stopColor="#DF6CF6"></stop>
            <stop offset="1" stopColor="#0196FF" stopOpacity="0"></stop>
            {linearGradient([490, 490, 480, 478, 475], [490, 479, 488], [266, 120], [284, 150], 2.2)}
          </linearGradient>


          <linearGradient gradientUnits="userSpaceOnUse" id="orange-pulse-1" x1={826} x2={826} y1={270} y2={340}>
            <stop stopColor="#FF7432" stopOpacity="0"></stop>
            <stop offset="0.0550784" stopColor="#FF7432"></stop>
            <stop offset="0.373284" stopColor="#F7CC4B"></stop>
            <stop offset="1" stopColor="#F7CC4B" stopOpacity="0"></stop>
            {linearGradient([826, 360], [826, 400], [270, 130], [340, 170], 2)}
          </linearGradient>


          <linearGradient gradientUnits="userSpaceOnUse" id="orange-pulse-2" x1={868} x2={868} y1={280} y2={440}>
            <stop stopColor="#FF7432" stopOpacity="0"></stop>
            <stop offset="0.0531089" stopColor="#FF7432"></stop>
            <stop offset="0.415114" stopColor="#F7CC4B"></stop>
            <stop offset="1" stopColor="#F7CC4B" stopOpacity="0"></stop>
            {linearGradient([868, 300], [868, 400], [280, 140], [440, 180], 2.5)}
          </linearGradient>

        </defs>
      </svg>
    </main >
  );
}

export const MainApp = () => {
  const [user, setUser] = useRecoilState(userAtom);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("user")) {
      navigate("/login");
    } else {
      setUser(JSON.parse(localStorage.getItem("user") ?? "{}"));
    }
  }, []);

  return user && <App user={user} />
}