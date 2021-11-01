const baseURL = "http://localhost:4006/";
const headers = new Headers();
var sessionId;

headers.set("Content-Type", "application/JSON");

const reqConf = {
  headers: headers,
  credentials: "include",
};

function safeFetch(verb, hitpoint, body) {
  return fetch(hitpoint, {
    method: verb,
    body: JSON.stringify(body),
    ...reqConf,
  })
    .catch((response) => {
      if (typeof response.message === "string")
        return Promise.reject(["Server connection failed"]);
      else return response;
    })
    .then((response) => {
      return response.ok ? response : response.json();
    })
    .then((rsp) => {
      if (typeof rsp.json === "function") return rsp;
      else throw rsp;
    });
}

export function post(endpoint, body) {
  return safeFetch("POST", baseURL + endpoint, body);
}

export function put(endpoint, body) {
  return safeFetch("PUT", baseURL + endpoint, body);
}

export function get(endpoint) {
  return safeFetch("GET", baseURL + endpoint);
}

export function del(endpoint) {
  return safeFetch("DELETE", baseURL + endpoint);
}

// Functions for performing the api requests

/**
 * Sign a user into the service, returning a promise of the
 * user data
 * @param {{email: string, password: string}} cred
 */
export function signIn(cred) {
  return post("Ssns", cred)
    .then((loginRes) => {
      let location = loginRes.headers.get("Location").split("/");
      sessionId = location[location.length - 1];
      return get("Ssns/" + sessionId);
    })
    .then((getLoginRes) => {
      if (getLoginRes) return getLoginRes.json();
    })
    .then((body) => {
      return get("Prss/" + body.prsId);
    })
    .then((currUserRes) => currUserRes.json())
    .then((rsp) => rsp[0]);
}

/**
 * @returns {Promise} result of the sign out request
 */
export function signOut() {
  return del("Ssns/" + sessionId);
}

export function register(user) {
  return post("Prss", user);
}

export function getMsgs(cnvId) {
  return get(`Cnvs/${cnvId}/Msgs`).then((msgs) => msgs.json());
}

export function postMsg(newMsg) {
  return post(`Cnvs/${newMsg.cnvId}/Msgs`, newMsg)
    .then((rsp) => {
      let locationHeader = rsp.headers.get("Location").split("/");
      let location = locationHeader[locationHeader.length - 1];
      return get(`Msgs/${location}`);
    })
    .then((rsp) => rsp.json())
    .then((responseJson) => responseJson);
}

export function postLike(msgId) {
  return post(`Msgs/${msgId}/Likes`)
    .then(() => get(`Msgs/${msgId}/Likes`))
    .then((rsp) => rsp.json())
    .then((responseJson) => responseJson);
}

export function getLikes(msgId) {
  return get(`Msgs/${msgId}/Likes`).then((res) => res.json());
}

export function getCnvs(userId) {
  return get("Cnvs" + (userId ? "?owner=" + userId : "")).then((res) =>
    res.json()
  );
}

export function putCnv(id, body) {
  return put(`Cnvs/${id}`, body).then((res) => {
    return { id, body };
  });
}

export function delCnv(id) {
  return del(`Cnvs/${id}`);
}

export function postCnv(body) {
  return post("Cnvs", body)
    .then((rsp) => {
      let locationHeader = rsp.headers.get("Location").split("/");
      let location = locationHeader[locationHeader.length - 1];
      return get(`Cnvs/${location}`);
    })
    .then((rsp) => rsp.json())
    .then((responseJson) => responseJson);
}

export const errMap = {
  en: {
    missingField: "Field missing from request: ",
    badValue: "Field has bad value: ",
    notFound: "Entity not present in DB",
    badLogin: "Email/password combination invalid",
    dupEmail: "Email duplicates an existing email",
    noTerms: "Acceptance of terms is required",
    forbiddenRole: "Role specified is not permitted.",
    noOldPwd: "Change of password requires an old password",
    oldPwdMismatch: "Old password that was provided is incorrect.",
    dupTitle: "Conversation title duplicates an existing one",
    dupEnrollment: "Duplicate enrollment",
    forbiddenField: "Field in body not allowed.",
    queryFailed: "Query failed (server problem).",
  },
  es: {
    missingField: "[ES] Field missing from request: ",
    badValue: "[ES] Field has bad value: ",
    notFound: "[ES] Entity not present in DB",
    badLogin: "[ES] Email/password combination invalid",
    dupEmail: "[ES] Email duplicates an existing email",
    noTerms: "[ES] Acceptance of terms is required",
    forbiddenRole: "[ES] Role specified is not permitted.",
    noOldPwd: "[ES] Change of password requires an old password",
    oldPwdMismatch: "[ES] Old password that was provided is incorrect.",
    dupTitle: "[ES] Conversation title duplicates an existing one",
    dupEnrollment: "[ES] Duplicate enrollment",
    forbiddenField: "[ES] Field in body not allowed.",
    queryFailed: "[ES] Query failed (server problem).",
  },
  swe: {
    missingField: "Ett fält saknas: ",
    badValue: "Fält har dåligt värde: ",
    notFound: "Entitet saknas i DB",
    badLogin: "Email/lösenord kombination ogilltig",
    dupEmail: "Email duplicerar en existerande email",
    noTerms: "Villkoren måste accepteras",
    forbiddenRole: "Angiven roll förjuden",
    noOldPwd: "Tidiagre lösenord krav för att updatera lösenordet",
    oldPwdMismatch: "Tidigare lösenord felaktigt",
    dupTitle: "Konversationstitel duplicerar tidigare existerande titel",
    dupEnrollment: "Duplicerad inskrivning",
    forbiddenField: "Förbjudet fält i meddelandekroppen",
    queryFailed: "Förfrågan misslyckades (server problem).",
  },
};

/**
 * @param {string} errTag
 * @param {string} lang
 */
export function errorTranslate(errTag, lang = "en") {
  return errMap[errTag] || "Unknown Error!";
}
