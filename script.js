// 1. Configuração de conexão com o Supabase
const SUPABASE_URL = "https://ksjwanjkwjstrybkvjrj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtzandhbmprd2pzdHJ5Ymt2anJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMDg1MjQsImV4cCI6MjA5Nzg4NDUyNH0.UIZi4OIKBNIQCYFuzd-4VKwVDEQIiBuJiIw-uI7QKZ0";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Lista de vendedoras da loja
const vendedoras = [
    "5511950881377", // Gisele
    "5511914633120", // Cilene
    "5511943344798", // Rilza
    "5511969694794", // Geisa
    "5511975431235", // Vanusa
    "5511925605361", // Débora
    "5511916448269", // Iverly
    "5511975888151", // Luciana
    "5511937470717", // Vânia
    "5511933316504", // Regina
    "5511933316682", // Andressa
    "5511910349490", // Geovana
    "5511980320702", // Vera
    "5511995015242", // Tifany
    "5511943318586", // Valda
    "5511932957376", // Tiana
    "5511910982867"  // Caixa
];

// 3. Mensagem que será enviada no WhatsApp
const mensagemTexto = "Olá! Vi o vestido no Instagram e gostaria de mais informações, disponibilidade de tamanhos e valores. Poderia me ajudar?";
const mensagemCodificada = encodeURIComponent(mensagemTexto);

// Função Fallback: Atendimento aleatório caso o banco caia ou demore
function redirecionarFallback() {
    console.log("Banco instável. Ativando redirecionamento de segurança (aleatório)...");
    const indiceAleatorio = Math.floor(Math.random() * vendedoras.length);
    window.location.replace(`https://wa.me/${vendedoras[indiceAleatorio]}?text=${mensagemCodificada}`);
}

// 4. Função principal do Rodízio com proteção de Timeout
async function rodizioInteligente() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
        // Busca a linha no banco com suporte ao AbortSignal
        const { data, error } = await supabase
            .from('controle_rodizio')
            .select('ultimo_indice', { abortSignal: controller.signal })
            .eq('id', 1)
            .single();

        clearTimeout(timeoutId);

        if (error) throw error;

        let ultimoIndice = data.ultimo_indice;
        let proximoIndice = (ultimoIndice + 1) % vendedoras.length;
        const numeroEscolhido = vendedoras[proximoIndice];

        // Atualiza o banco com o novo índice
        await supabase
            .from('controle_rodizio')
            .update({ ultimo_indice: proximoIndice })
            .eq('id', 1);

        window.location.replace(`https://wa.me/${numeroEscolhido}?text=${mensagemCodificada}`);

    } catch (err) {
        clearTimeout(timeoutId);
        console.error("Erro no rodízio:", err);
        redirecionarFallback();
    }
}

// Inicia o processo após carregar a página
window.onload = function() {
    setTimeout(rodizioInteligente, 2500); 
};