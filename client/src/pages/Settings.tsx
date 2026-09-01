export function Settings() {
  return (
    <div className="mx-auto max-w-5xl px-8 py-8">
      <h1 className="text-2xl font-semibold text-black">Configurações</h1>
      <p className="mt-1 text-sm text-stone-500">Catálogo de aparelhos, regras de troca e dados da loja.</p>

      <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
        <p className="font-medium text-black">Em breve</p>
        <p className="mt-1 text-sm text-stone-500">
          Aqui será possível editar o catálogo de aparelhos, os preços de troca e os descontos do checklist de
          avaliação.
        </p>
      </div>
    </div>
  );
}
