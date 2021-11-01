export default function Cnvs(state = [], action) {
  switch (action.type) {
    case "UPDATE_CNVS": // Replace previous cnvs
      return action.cnvs;
    case "UPDATE_CNV":
      return state.map((cnv) => {
        if (cnv.id === action.cnvs.id)
          return Object.assign({}, cnv, { title: action.cnvs.body.title });
        else return cnv;
      });
    case "DELETE_CNV":
      return state.filter((cnv) => {
        return cnv.id !== action.cnvId;
      });
    case "ADD_CNV":
      return state.concat(action.cnv);
    default:
      return state;
  }
}
