import Loadable from "react-loadable";

export default Loadable({
  loader: () => import('./InnerTransactionlistPage'),
  loading: () => false
});
