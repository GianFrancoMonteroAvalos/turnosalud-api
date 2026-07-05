fetch("http://localhost:8080/practicas")
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));