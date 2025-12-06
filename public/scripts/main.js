async function navBar() {
  let response = await fetch("/api/sessions/online");
  response = await response.json();
  console.log(response);

  let template = "";
  if (response.statusCode === 200) {
    template = ` <nav class="navbar"> <ul> <li><a
  href="/">Home</a></li> <li><a href="/products">Productos</a></li> <li><a
  href="/users">Usuarios</a></li> <li> <a href="/cart/myCart">Carrito</a></li>
  <li> <a href="/users/profile">Profile</a></li> <li><button id="signedout">Signed Out</button></li> </ul> </nav> `;
  } else {
    template = ` <nav class="navbar"> <ul> <li><a href="/">Home</a></li> <li><a
  href="/products">Productos</a></li> <li><a href="/users">Usuarios</a></li>
  <li><a href="/register">Register</a></li> <li><a href="/login">Login</a></li>
  </ul> </nav> `;
  }
  document.getElementById("navbar").innerHTML = template;
  const btn = document.getElementById("signedout");
  if (btn) {
    btn.addEventListener("click", async () => {
      const opts = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      };
      let response = await fetch("/api/sessions/signout", opts);
      response = await response.json();

      if (response.statusCode === 200) {
        location.replace("/");
      }
    });
  }
}
navBar();
