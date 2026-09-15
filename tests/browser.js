/* Executa os mesmos testes disponíveis para Node.js, agora no navegador. */
function showTestResults() {
  const summary = document.getElementById("testSummary");
  const list = document.getElementById("testResults");
  list.replaceChildren();
  try {
    const report = runChecks();
    summary.textContent = report.passed + " de " + report.total + " testes passaram.";
    summary.classList.toggle("error", report.failed > 0);
    for (const result of report.results) {
      const item = document.createElement("li");
      item.textContent = (result.passed ? "PASSOU — " : "FALHOU — ") + result.name + (result.error ? ": " + result.error : "");
      item.style.color = result.passed ? "#275d45" : "#963f1e";
      item.style.marginBottom = "7px";
      list.appendChild(item);
    }
  } catch (error) {
    summary.textContent = "Não foi possível executar os testes: " + error.message;
    summary.classList.add("error");
  }
}
document.getElementById("runTests").addEventListener("click", showTestResults);
showTestResults();
