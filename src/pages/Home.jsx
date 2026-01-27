import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <h1>Home</h1>
      <Link to="/admin">Go to Admin</Link>
    </div>
  );
}
