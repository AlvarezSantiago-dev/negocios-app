const loginBtn = document.querySelector("#login");
loginBtn.addEventListener("click", async () => {
  const data = {
    email: document.querySelector("#email").value,
    password: document.querySelector("#password").value,
  };
  console.log("DATAFRONT:", data);
  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  try {
    let response = await fetch("/api/sessions/login", opts);
    response = await response.json();
    console.log("RESPONSE BACK:", response);
    if (response.statusCode === 200) {
      location.replace("/");
    }
  } catch (error) {
    console.error("Erroren fetch:", error);
  }
});
