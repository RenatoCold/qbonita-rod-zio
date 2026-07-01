// 1. Configuração de conexão com o Supabase
const SUPABASE_URL = "https://ksjwanjkwjstrybkvjrj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtzandhbmprd2pzdHJ5Ymt2anJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMDg1MjQsImV4cCI6MjA5Nzg4NDUyNH0.UIZi4OIKBNIQCYFuzd-4VKwVDEQIiBuJiIw-uI7QKZ0";

// Inicializa o cliente do Supabase (a biblioteca que importamos no HTML)
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Lista de vendedoras da sua tia (coloque os números REAIS aqui na ordem)
const vendedoras = [
    "5511999999991", // Vendedora Índice 0
    "5511999999992", // Vendedora Índice 1
    "5511999999993"  // Vendedora Índice 2
];

// 3. Texto padrão do WhatsApp
const mensagemTexto = "Olá! Vi o vestido no Instagram e gostaria de mais informações.";
const mensagemCodificada = encodeURIComponent(mensagemTexto);

// 4. Função principal do Rodízio Inteligente
async function rodizioInteligente() {
    try {
        // A. Busca a linha de controle no banco de dados (id 1 que inserimos manual)
        const { data, error } = await supabase
            .from('controle_rodizio')
            .select('ultimo_indice')
            .eq('id', 1) // Garante que estamos pegando a linha certa
            .single();

        if (error) throw error;

        let ultimoIndice = data.ultimo_indice;
        
        // B. Calcula o próximo índice da fila
        // Se o último foi a vendedora 2 e a lista tem 3 vendedoras, o próximo é (2 + 1) % 3 = 0 (volta pro começo)
        let proximoIndice = (ultimoIndice + 1) % vendedoras.length;
        
        // C. Pega o número da vendedora escolhida
        const numeroEscolhido = vendedoras[proximoIndice];

        // D. Atualiza o banco de dados com o novo índice ANTES de sair da página
        await supabase
            .from('controle_rodizio')
            .update({ ultimo_indice: proximoIndice })
            .eq('id', 1);

        // E. Monta o link e joga pro WhatsApp
        const linkFinal = `https://wa.me/${numeroEscolhido}?text=${mensagemCodificada}`;
        window.location.replace(linkFinal);

    } catch (err) {
        console.error("Erro no rodízio, usando fallback aleatório:", err);
        // Fallback: se o banco falhar por algum motivo, o sistema não quebra e faz o sorteio aleatório básico
        const indiceAleatorio = Math.floor(Math.random() * vendedoras.length);
        window.location.replace(`https://wa.me/${vendedoras[indiceAleatorio]}?text=${mensagemCodificada}`);
    }
}

// 5. Executa após o tempo do loading (2.5 segundos)
window.onload = function() {
    setTimeout(rodizioInteligente, 2500); 
};