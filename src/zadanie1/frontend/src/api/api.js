//Central part for all HTTP request on PHP backend

const BASE_URL = "http://localhost:8080/zadanie1/backend/api";

async function request(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    const data = await res.json();

    if(!res.ok) {
        throw { status: res.status, ...data };
    }

    return data;
}

//Olympians
export function getAthletes(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if(v !== undefined && v !== "") query.set(k, String(v));
    });
    return request(`/athletes.php?${query.toString()}`);
}

export function getAthlete(id) {
  return request(`/athlete.php?id=${id}`);
}


//Auth
export function register(data){
    return request('/auth/register.php', { method: 'POST', body: JSON.stringify(data) });
}

export function login(email, password) {
    return request("/auth/login.php", {
        method: "POST",
        body: JSON.stringify({email, password}),
    });
}

export function verify2fa(code) {
    return request("/auth/verify-2fa.php", {
        method: "POST",
        body: JSON.stringify({code}),
    });
}

export function logout(){
    return request("/auth/logout.php", {method: "POST"});
}


export function getMe(){
    return request("/auth/me.php");
}

export function updateProfile(data) {
  return request('/auth/profile.php', { method: 'POST', body: JSON.stringify(data) });
}

export function getLoginHistory() {
  return request('/auth/login-history.php');
}

//Import

export async function importCSV(file) {
    const formData = new FormData();
    formData.append("csv_file", file);

    const res = await fetch(`${BASE_URL}/import.php`, {
        method: "POST",
        credentials: "include",
        body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
        throw { status: res.status, ...data };
    }

    return data;
}

export function clearData() {
  return request('/clear-data.php', { method: 'POST' });
}