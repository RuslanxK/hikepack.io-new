import { Fragment } from "react/jsx-runtime";
import Trips from "../trips/trips";
// import ProductList from "@/product-list";

  
const Home: React.FC = () => {
  return (
     <Fragment>
       <Trips/>
       {/* <ProductList/>  */}
     </Fragment>
  );
};

export default Home;
