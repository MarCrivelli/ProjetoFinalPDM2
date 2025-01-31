import "../css/styles.css";

// Quando a página termina de carregar, a função listarPetshops() é usada pra preencher o "select" com os petshops que foram cadastrados.
document.addEventListener("DOMContentLoaded", () => {
  listarPetshops();
});

// Essa função abre ou cria ou abre um banco indexedDB. Se o banco não existir, ele é criado chamando o evento "onupgradeneeded". Se ele existir, ele é aberto.
function abrirBanco(callback) {
  const dbRequest = indexedDB.open("petshopDB", 1);

  dbRequest.onupgradeneeded = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("petshops")) {
      db.createObjectStore("petshops", { keyPath: "id", autoIncrement: true });
    }
  };

  // Se der bom na abertura do banco, ele é passado para a função de callback que pode fazer algumas operações, como salvar ou listar os petshops.
  dbRequest.onsuccess = (event) => {
    const db = event.target.result;
    callback(db);
  };

  dbRequest.onerror = (event) => {
    console.error("Erro ao abrir o IndexedDB:", event.target.error);
  };
}

// Função para salvar um petshop
function salvarPetshop(event) {
  event.preventDefault();

  const nome = document.getElementById("nome-petshop").value.trim();
  const lat = document.getElementById("latitude").value.trim();
  const long = document.getElementById("longitude").value.trim();

  if (!nome || !lat || !long) {
    alert("Preencha todos os campos!");
    return;
  }

  //Abre o banco e cria uma transação do tipo readwrite (para modificar os dados) e adiciona o petshop ao banco de dados.
  abrirBanco((db) => {
    const tx = db.transaction("petshops", "readwrite");
    const store = tx.objectStore("petshops");
    store.add({ nome, latitude: lat, longitude: long });

    tx.oncomplete = () => {
      alert("Petshop salvo!");
      listarPetshops();
    };

    tx.onerror = (event) => {
      console.error("Erro ao salvar petshop:", event.target.error);
    };
  });
}

// Função para listar petshops no select
function listarPetshops() {
  abrirBanco((db) => {
    const selectPetshops = document.getElementById("lista-petshops");
    selectPetshops.innerHTML = '<option value="">Selecione um Petshop</option>';

    const tx = db.transaction("petshops", "readonly");
    const store = tx.objectStore("petshops");

    store.openCursor().onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const petshop = cursor.value;
        const option = document.createElement("option");
        option.value = `${petshop.latitude},${petshop.longitude}`;
        option.textContent = `${petshop.nome} - (${petshop.latitude}, ${petshop.longitude})`;
        selectPetshops.appendChild(option);
        cursor.continue();
      }
    };
  });
}

// Função para mostrar o mapa do petshop selecionado
function mostrarMapa() {
  const selectPetshops = document.getElementById("lista-petshops");
  const mapa = document.getElementById("mapa");
  const petshopNome = document.getElementById("petshop-nome");

  const selectedOption = selectPetshops.options[selectPetshops.selectedIndex];

  if (!selectedOption.value) {
    alert("Selecione um Petshop primeiro!");
    return;
  }

  const [lat, long] = selectedOption.value.split(",");

  mapa.src = `https://maps.google.com/maps?q=${lat},${long}&z=15&output=embed`;
  mapa.style.display = "block";
  petshopNome.textContent = selectedOption.textContent.split(" - ")[0];
}

// Eventos
document.getElementById("petshop-form").addEventListener("submit", salvarPetshop);
document.getElementById("mostrar-mapa").addEventListener("click", mostrarMapa);
