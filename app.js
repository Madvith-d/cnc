/**
 * CNC Laboratory Portal - Application Controller
 * Interactive code browser, syntax highlighter, and topology visualizer
 */

(function () {
  'use strict';

  // State
  let currentProgramId = 'p1';
  let activeFileIndex = 0;
  let activeTheme = localStorage.getItem('cnc_theme') || 'dark';

  // Apply Theme
  document.documentElement.setAttribute('data-theme', activeTheme);

  // HTML Entity Escaper
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* ===================================================================
     SYNTAX HIGHLIGHTING ENGINE
     =================================================================== */

  function highlightTcl(code) {
    const patterns = [
      { type: 'comment', regex: /^\s*#[^\r\n]*/ },
      { type: 'string', regex: /^"(?:\\.|[^"\\])*"/ },
      { type: 'variable', regex: /^\$[a-zA-Z0-9_]+/ },
      { type: 'keyword', regex: /^(?:set|new|proc|global|exec|exit|close|open|catch|if|else|for|while|return|puts)\b/ },
      { type: 'class', regex: /^(?:Simulator|node|duplex-link|duplex-link-op|queue-limit|attach-agent|connect|at|run|flush-trace|trace-all|namtrace-all|make-lan|DropTail|Agent\/TCP|Agent\/TCPSink|Agent\/UDP|Agent\/Null|Application\/FTP|Application\/Traffic\/CBR|LL|Queue\/DropTail|Mac\/802_3|Channel)\b/ },
      { type: 'number', regex: /^\b\d+(?:\.\d+)?(?:Mb|Kb|ms|s|mb|kb)?\b/ },
      { type: 'bracket', regex: /^[\[\]\{\}\(\)]/ },
      { type: 'operator', regex: /^(?:\+\+|--|\+=|-=|\*=|\/=|==|!=|<=|>=|&&|\|\||[+\-*\/=<>!&|])/ },
      { type: 'text', regex: /^[a-zA-Z0-9_\-]+/ },
      { type: 'space', regex: /^\s+/ },
      { type: 'other', regex: /^./ }
    ];

    let i = 0, html = '';
    while (i < code.length) {
      let sub = code.slice(i);
      let matched = false;
      for (let p of patterns) {
        let m = sub.match(p.regex);
        if (m && m.index === 0) {
          let val = escapeHtml(m[0]);
          if (p.type === 'space' || p.type === 'other' || p.type === 'text') {
            html += val;
          } else {
            html += `<span class="token-${p.type}">${val}</span>`;
          }
          i += m[0].length;
          matched = true;
          break;
        }
      }
      if (!matched) {
        html += escapeHtml(sub[0]);
        i++;
      }
    }
    return html;
  }

  function highlightAwk(code) {
    const patterns = [
      { type: 'comment', regex: /^\s*#[^\r\n]*/ },
      { type: 'string', regex: /^"(?:\\.|[^"\\])*"/ },
      { type: 'field', regex: /^\$[0-9]+/ },
      { type: 'keyword', regex: /^(?:BEGIN|END|if|else|while|for|print|printf|sprintf|next|exit)\b/ },
      { type: 'operator', regex: /^(?:\+\+|--|\+=|-=|\*=|\/=|==|!=|<=|>=|&&|\|\||[+\-*\/%=<>!])/ },
      { type: 'number', regex: /^\b\d+(?:\.\d+)?\b/ },
      { type: 'bracket', regex: /^[\[\]\{\}\(\);,]/ },
      { type: 'variable', regex: /^(?:ntcp|nudp|sSize|startTime|stopTime|tput|count|type|event|time|size|dropCount|packetSize)\b/ },
      { type: 'text', regex: /^[a-zA-Z0-9_\-]+/ },
      { type: 'space', regex: /^\s+/ },
      { type: 'other', regex: /^./ }
    ];

    let i = 0, html = '';
    while (i < code.length) {
      let sub = code.slice(i);
      let matched = false;
      for (let p of patterns) {
        let m = sub.match(p.regex);
        if (m && m.index === 0) {
          let val = escapeHtml(m[0]);
          if (p.type === 'space' || p.type === 'other' || p.type === 'text') {
            html += val;
          } else {
            html += `<span class="token-${p.type}">${val}</span>`;
          }
          i += m[0].length;
          matched = true;
          break;
        }
      }
      if (!matched) {
        html += escapeHtml(sub[0]);
        i++;
      }
    }
    return html;
  }

  function highlightBash(code) {
    const patterns = [
      { type: 'comment', regex: /^\s*#[^\r\n]*/ },
      { type: 'string', regex: /^"(?:\\.|[^"\\])*"|^'(?:\\.|[^'\\])*'/ },
      { type: 'variable', regex: /^\$[a-zA-Z0-9_]+|^\$\{[^}]+\}/ },
      { type: 'keyword', regex: /^(?:if|then|else|elif|fi|for|while|do|done|case|esac|function|exit|export|return)\b/ },
      { type: 'class', regex: /^(?:echo|sudo|pacman|yay|git|cd|makepkg|rm|tar|make|install|set|grep|awk|ns|nam)\b/ },
      { type: 'number', regex: /^\b\d+\b/ },
      { type: 'bracket', regex: /^[\[\]\{\}\(\);]/ },
      { type: 'operator', regex: /^(?:&&|\|\||[=<>!|&])/ },
      { type: 'text', regex: /^[a-zA-Z0-9_\-\.\/]+/ },
      { type: 'space', regex: /^\s+/ },
      { type: 'other', regex: /^./ }
    ];

    let i = 0, html = '';
    while (i < code.length) {
      let sub = code.slice(i);
      let matched = false;
      for (let p of patterns) {
        let m = sub.match(p.regex);
        if (m && m.index === 0) {
          let val = escapeHtml(m[0]);
          if (p.type === 'space' || p.type === 'other' || p.type === 'text') {
            html += val;
          } else {
            html += `<span class="token-${p.type}">${val}</span>`;
          }
          i += m[0].length;
          matched = true;
          break;
        }
      }
      if (!matched) {
        html += escapeHtml(sub[0]);
        i++;
      }
    }
    return html;
  }

  function highlightPython(code) {
    const patterns = [
      { type: 'comment', regex: /^\s*#[^\r\n]*/ },
      { type: 'string', regex: /^("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/ },
      { type: 'decorator', regex: /^@[a-zA-Z_][a-zA-Z0-9_.]*/ },
      { type: 'keyword', regex: /^(?:def|class|import|from|as|return|if|elif|else|while|for|in|try|except|finally|with|pass|break|continue|lambda|yield|raise|assert|global|nonlocal|async|await)\b/ },
      { type: 'boolean', regex: /^(?:True|False|None)\b/ },
      { type: 'class', regex: /^(?:socket|AF_INET|SOCK_STREAM|SOCK_DGRAM|SOL_SOCKET|SO_REUSEADDR|threading|Thread|Process|Exception)\b/ },
      { type: 'builtin', regex: /^(?:print|input|range|len|int|str|float|bytes|bytearray|list|dict|set|tuple|open|type|enumerate|zip|sum|min|max|format|bin|hex|ord|chr)\b/ },
      { type: 'number', regex: /^\b(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?\b/ },
      { type: 'bracket', regex: /^[\[\]\{\}\(\);,:]/ },
      { type: 'operator', regex: /^(?:\*\*|\/\/|<<|>>|\+=|-=|\*=|\/=|%=|&=|\|=|\^=|==|!=|<=|>=|[+\-*\/%=<>!&|^~])/ },
      { type: 'ident', regex: /^[a-zA-Z_][a-zA-Z0-9_]*/ },
      { type: 'space', regex: /^\s+/ },
      { type: 'other', regex: /^./ }
    ];

    let i = 0, html = '';
    while (i < code.length) {
      let sub = code.slice(i);
      let matched = false;
      for (let p of patterns) {
        let m = sub.match(p.regex);
        if (m && m.index === 0) {
          let val = escapeHtml(m[0]);
          if (p.type === 'space' || p.type === 'other' || p.type === 'ident') {
            html += val;
          } else {
            html += `<span class="token-${p.type}">${val}</span>`;
          }
          i += m[0].length;
          matched = true;
          break;
        }
      }
      if (!matched) {
        html += escapeHtml(sub[0]);
        i++;
      }
    }
    return html;
  }

  function highlightC(code) {
    const patterns = [
      { type: 'comment', regex: /^\/\/[^\r\n]*|^\/\*[\s\S]*?\*\// },
      { type: 'preprocessor', regex: /^#[a-zA-Z_]+(?:\s*<[^>]+>|\s*"[^"]+")?/ },
      { type: 'string', regex: /^"(?:\\.|[^"\\])*"|^'(?:\\.|[^'\\])*'/ },
      { type: 'keyword', regex: /^(?:int|char|float|double|void|struct|union|typedef|enum|return|if|else|while|for|do|switch|case|break|continue|default|sizeof|static|const|extern|volatile|unsigned|signed|short|long)\b/ },
      { type: 'builtin', regex: /^(?:printf|scanf|malloc|free|calloc|realloc|exit|memset|memcpy|strcpy|strlen|strcmp|main)\b/ },
      { type: 'number', regex: /^\b(?:0x[0-9a-fA-F]+|\d+(?:\.\d+)?)\b/ },
      { type: 'bracket', regex: /^[\[\]\{\}\(\);,]/ },
      { type: 'operator', regex: /^(?:\+\+|--|->|<<|>>|\+=|-=|\*=|\/=|%=|&=|\|=|\^=|==|!=|<=|>=|[+\-*\/%=<>!&|^~])/ },
      { type: 'ident', regex: /^[a-zA-Z_][a-zA-Z0-9_]*/ },
      { type: 'space', regex: /^\s+/ },
      { type: 'other', regex: /^./ }
    ];

    let i = 0, html = '';
    while (i < code.length) {
      let sub = code.slice(i);
      let matched = false;
      for (let p of patterns) {
        let m = sub.match(p.regex);
        if (m && m.index === 0) {
          let val = escapeHtml(m[0]);
          if (p.type === 'space' || p.type === 'other' || p.type === 'ident') {
            html += val;
          } else {
            html += `<span class="token-${p.type}">${val}</span>`;
          }
          i += m[0].length;
          matched = true;
          break;
        }
      }
      if (!matched) {
        html += escapeHtml(sub[0]);
        i++;
      }
    }
    return html;
  }

  function highlightCode(code, lang) {
    if (!code) return '';
    if (lang === 'python' || lang === 'py') return highlightPython(code);
    if (lang === 'c' || lang === 'cpp' || lang === 'h') return highlightC(code);
    if (lang === 'tcl') return highlightTcl(code);
    if (lang === 'awk') return highlightAwk(code);
    if (lang === 'bash' || lang === 'sh') return highlightBash(code);
    return escapeHtml(code);
  }

  /* ===================================================================
     TOPOLOGY SVG DIAGRAM BUILDERS
     =================================================================== */

  function renderTopologySvg(programId) {
    if (programId === 'p1') {
      return `
        <svg viewBox="0 0 760 170" width="100%" height="170" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
            </marker>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.5"/>
            </filter>
          </defs>

          <!-- Links -->
          <line x1="130" y1="85" x2="350" y2="85" stroke="#334155" stroke-width="4" stroke-dasharray="6,4"/>
          <line x1="390" y1="85" x2="610" y2="85" stroke="#334155" stroke-width="4" stroke-dasharray="6,4"/>

          <!-- Animated CBR Flow -->
          <line x1="130" y1="85" x2="350" y2="85" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arrow-blue)"/>
          <line x1="390" y1="85" x2="610" y2="85" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arrow-blue)"/>

          <!-- Link Labels -->
          <rect x="180" y="55" width="120" height="22" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
          <text x="240" y="70" fill="#38bdf8" font-size="11" font-family="monospace" text-anchor="middle" font-weight="600">500Kb • 10ms (Q:5)</text>

          <rect x="440" y="55" width="120" height="22" rx="4" fill="#1e293b" stroke="#f43f5e" stroke-width="1"/>
          <text x="500" y="70" fill="#f43f5e" font-size="11" font-family="monospace" text-anchor="middle" font-weight="600">500Kb • 10ms (Q:5)</text>

          <!-- Node 0 -->
          <g filter="url(#glow)">
            <circle cx="110" cy="85" r="28" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5"/>
            <text x="110" y="90" fill="#f8fafc" font-size="13" font-weight="700" text-anchor="middle">n0</text>
            <text x="110" y="130" fill="#94a3b8" font-size="11" text-anchor="middle">Source (UDP)</text>
            <rect x="75" y="138" width="70" height="18" rx="3" fill="rgba(56,189,248,0.15)"/>
            <text x="110" y="151" fill="#38bdf8" font-size="10" font-family="monospace" text-anchor="middle">CBR App</text>
          </g>

          <!-- Node 1 (Router) -->
          <g filter="url(#glow)">
            <circle cx="370" cy="85" r="28" fill="#1e293b" stroke="#f59e0b" stroke-width="2.5"/>
            <text x="370" y="90" fill="#f8fafc" font-size="13" font-weight="700" text-anchor="middle">n1</text>
            <text x="370" y="130" fill="#f59e0b" font-size="11" font-weight="600" text-anchor="middle">Intermediate Router</text>
            <text x="370" y="146" fill="#94a3b8" font-size="10" text-anchor="middle">DropTail Queue (5)</text>
          </g>

          <!-- Node 2 (Sink) -->
          <g filter="url(#glow)">
            <circle cx="630" cy="85" r="28" fill="#1e293b" stroke="#10b981" stroke-width="2.5"/>
            <text x="630" y="90" fill="#f8fafc" font-size="13" font-weight="700" text-anchor="middle">n2</text>
            <text x="630" y="130" fill="#94a3b8" font-size="11" text-anchor="middle">Destination</text>
            <rect x="595" y="138" width="70" height="18" rx="3" fill="rgba(16,185,129,0.15)"/>
            <text x="630" y="151" fill="#10b981" font-size="10" font-family="monospace" text-anchor="middle">Agent/Null</text>
          </g>
        </svg>
      `;
    }

    if (programId === 'p2') {
      return `
        <svg viewBox="0 0 760 250" width="100%" height="250" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="arr-tcp" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
            </marker>
            <marker id="arr-udp" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b"/>
            </marker>
          </defs>

          <!-- Links -->
          <line x1="145" y1="65" x2="360" y2="120" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-tcp)"/>
          <line x1="145" y1="185" x2="360" y2="130" stroke="#f59e0b" stroke-width="2.5" marker-end="url(#arr-udp)"/>
          <line x1="415" y1="125" x2="610" y2="125" stroke="#cbd5e1" stroke-width="4"/>

          <!-- Link labels -->
          <rect x="200" y="65" width="110" height="20" rx="3" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
          <text x="255" y="79" fill="#38bdf8" font-size="10" font-family="monospace" text-anchor="middle">1Mb • 10ms (Q:50)</text>

          <rect x="200" y="165" width="110" height="20" rx="3" fill="#1e293b" stroke="#f59e0b" stroke-width="1"/>
          <text x="255" y="179" fill="#f59e0b" font-size="10" font-family="monospace" text-anchor="middle">1Mb • 10ms (Q:50)</text>

          <rect x="460" y="105" width="130" height="20" rx="3" fill="#1e293b" stroke="#f43f5e" stroke-width="1"/>
          <text x="525" y="119" fill="#f43f5e" font-size="10" font-family="monospace" text-anchor="middle">Bottleneck 1Mb • 10ms</text>

          <!-- n0 (TCP) -->
          <circle cx="120" cy="65" r="26" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5"/>
          <text x="120" y="70" fill="#f8fafc" font-size="13" font-weight="700" text-anchor="middle">n0</text>
          <text x="120" y="105" fill="#38bdf8" font-size="11" font-weight="600" text-anchor="middle">TCP / FTP</text>

          <!-- n1 (UDP) -->
          <circle cx="120" cy="185" r="26" fill="#1e293b" stroke="#f59e0b" stroke-width="2.5"/>
          <text x="120" y="190" fill="#f8fafc" font-size="13" font-weight="700" text-anchor="middle">n1</text>
          <text x="120" y="225" fill="#f59e0b" font-size="11" font-weight="600" text-anchor="middle">UDP / CBR</text>

          <!-- n2 (Router) -->
          <circle cx="390" cy="125" r="28" fill="#1e293b" stroke="#a855f7" stroke-width="2.5"/>
          <text x="390" y="130" fill="#f8fafc" font-size="13" font-weight="700" text-anchor="middle">n2</text>
          <text x="390" y="170" fill="#a855f7" font-size="11" font-weight="600" text-anchor="middle">Central Switch</text>

          <!-- n3 (Sink) -->
          <circle cx="635" cy="125" r="28" fill="#1e293b" stroke="#10b981" stroke-width="2.5"/>
          <text x="635" y="130" fill="#f8fafc" font-size="13" font-weight="700" text-anchor="middle">n3</text>
          <text x="635" y="170" fill="#10b981" font-size="11" font-weight="600" text-anchor="middle">Shared Destination</text>
          <text x="635" y="186" fill="#94a3b8" font-size="10" text-anchor="middle">TCPSink + Null</text>
        </svg>
      `;
    }

    if (programId === 'p3') {
      return `
        <svg viewBox="0 0 760 260" width="100%" height="260" xmlns="http://www.w3.org/2000/svg">
          <!-- Central Ethernet Bus Backbone -->
          <rect x="70" y="115" width="480" height="12" rx="6" fill="#38bdf8"/>
          <text x="310" y="105" fill="#38bdf8" font-size="11" font-family="monospace" text-anchor="middle" font-weight="700">
            Ethernet Bus (make-lan): 10Mb • 10ms • Mac/802_3
          </text>

          <!-- Drop Lines to Bus -->
          <line x1="110" y1="55" x2="110" y2="115" stroke="#64748b" stroke-width="2"/>
          <line x1="210" y1="55" x2="210" y2="115" stroke="#64748b" stroke-width="2"/>
          <line x1="310" y1="55" x2="310" y2="115" stroke="#64748b" stroke-width="2"/>
          <line x1="410" y1="55" x2="410" y2="115" stroke="#64748b" stroke-width="2"/>

          <line x1="110" y1="185" x2="110" y2="127" stroke="#64748b" stroke-width="2"/>
          <line x1="210" y1="185" x2="210" y2="127" stroke="#64748b" stroke-width="2"/>
          <line x1="310" y1="185" x2="310" y2="127" stroke="#64748b" stroke-width="2"/>
          <line x1="410" y1="185" x2="410" y2="127" stroke="#64748b" stroke-width="2"/>

          <!-- Top Row Nodes (n0..n3) -->
          <circle cx="110" cy="45" r="20" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
          <text x="110" y="49" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">n0</text>
          <text x="110" y="20" fill="#38bdf8" font-size="10" font-weight="600" text-anchor="middle">TCP/FTP</text>

          <circle cx="210" cy="45" r="18" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
          <text x="210" y="49" fill="#94a3b8" font-size="10" text-anchor="middle">n1</text>

          <circle cx="310" cy="45" r="18" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
          <text x="310" y="49" fill="#94a3b8" font-size="10" text-anchor="middle">n2</text>

          <circle cx="410" cy="45" r="18" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
          <text x="410" y="49" fill="#94a3b8" font-size="10" text-anchor="middle">n3</text>

          <!-- Bottom Row Nodes (n4..n7) -->
          <circle cx="110" cy="195" r="18" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
          <text x="110" y="199" fill="#94a3b8" font-size="10" text-anchor="middle">n4</text>

          <circle cx="210" cy="195" r="18" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
          <text x="210" y="199" fill="#94a3b8" font-size="10" text-anchor="middle">n5</text>

          <circle cx="310" cy="195" r="18" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
          <text x="310" y="199" fill="#94a3b8" font-size="10" text-anchor="middle">n6</text>

          <circle cx="410" cy="195" r="22" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
          <text x="410" y="199" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">n7</text>
          <text x="410" y="230" fill="#f59e0b" font-size="10" font-weight="600" text-anchor="middle">LAN Gateway</text>

          <!-- Gateway Link n7 -> n8 -->
          <line x1="432" y1="195" x2="610" y2="195" stroke="#f43f5e" stroke-width="3"/>
          <rect x="470" y="170" width="115" height="18" rx="3" fill="#1e293b" stroke="#f43f5e" stroke-width="1"/>
          <text x="527" y="183" fill="#f43f5e" font-size="10" font-family="monospace" text-anchor="middle">1Mb • 10ms (Q:50)</text>

          <!-- Destination Node n8 -->
          <circle cx="635" cy="195" r="24" fill="#1e293b" stroke="#10b981" stroke-width="2.5"/>
          <text x="635" y="199" fill="#f8fafc" font-size="12" font-weight="700" text-anchor="middle">n8</text>
          <text x="635" y="232" fill="#10b981" font-size="10" font-weight="600" text-anchor="middle">TCPSink</text>
        </svg>
      `;
    }

    if (programId === 'p4') {
      return `
        <svg viewBox="0 0 760 260" width="100%" height="260" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="arr-p4-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8"/>
            </marker>
            <marker id="arr-p4-cyan" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#06b6d4"/>
            </marker>
          </defs>
          <!-- Central Ethernet Bus Backbone -->
          <rect x="70" y="115" width="480" height="12" rx="6" fill="#38bdf8"/>
          <text x="310" y="105" fill="#38bdf8" font-size="11" font-family="monospace" text-anchor="middle" font-weight="700">
            Ethernet Bus (make-lan): 10Mb • 10ms • Mac/802_3
          </text>

          <!-- Drop Lines to Bus -->
          <line x1="110" y1="55" x2="110" y2="115" stroke="#64748b" stroke-width="2"/>
          <line x1="210" y1="55" x2="210" y2="115" stroke="#64748b" stroke-width="2"/>
          <line x1="310" y1="55" x2="310" y2="115" stroke="#64748b" stroke-width="2"/>
          <line x1="410" y1="55" x2="410" y2="115" stroke="#64748b" stroke-width="2"/>

          <line x1="110" y1="185" x2="110" y2="127" stroke="#64748b" stroke-width="2"/>
          <line x1="210" y1="185" x2="210" y2="127" stroke="#64748b" stroke-width="2"/>
          <line x1="310" y1="185" x2="310" y2="127" stroke="#64748b" stroke-width="2"/>
          <line x1="410" y1="185" x2="410" y2="127" stroke="#64748b" stroke-width="2"/>

          <!-- Top Row Nodes: Src1 (n0), Src2 (n1), n2, n3 -->
          <circle cx="110" cy="45" r="22" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5"/>
          <text x="110" y="49" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">n0</text>
          <text x="110" y="18" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">Src1 (TCP0)</text>

          <circle cx="210" cy="45" r="22" fill="#1e293b" stroke="#06b6d4" stroke-width="2.5"/>
          <text x="210" y="49" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">n1</text>
          <text x="210" y="18" fill="#06b6d4" font-size="10" font-weight="700" text-anchor="middle">Src2 (TCP1)</text>

          <circle cx="310" cy="45" r="18" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
          <text x="310" y="49" fill="#94a3b8" font-size="10" text-anchor="middle">n2</text>

          <circle cx="410" cy="45" r="18" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
          <text x="410" y="49" fill="#94a3b8" font-size="10" text-anchor="middle">n3</text>

          <!-- Bottom Row Nodes: n4, n5, Dst2 (n6), Gateway (n7) -->
          <circle cx="110" cy="195" r="18" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
          <text x="110" y="199" fill="#94a3b8" font-size="10" text-anchor="middle">n4</text>

          <circle cx="210" cy="195" r="18" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
          <text x="210" y="199" fill="#94a3b8" font-size="10" text-anchor="middle">n5</text>

          <circle cx="310" cy="195" r="22" fill="#1e293b" stroke="#06b6d4" stroke-width="2.5"/>
          <text x="310" y="199" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">n6</text>
          <text x="310" y="232" fill="#06b6d4" font-size="10" font-weight="700" text-anchor="middle">Dst2 (Sink2)</text>

          <circle cx="410" cy="195" r="22" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
          <text x="410" y="199" fill="#f8fafc" font-size="11" font-weight="700" text-anchor="middle">n7</text>
          <text x="410" y="232" fill="#f59e0b" font-size="10" font-weight="600" text-anchor="middle">Gateway</text>

          <!-- Duplex Link n7 -> n8 -->
          <line x1="432" y1="195" x2="610" y2="195" stroke="#f43f5e" stroke-width="3"/>
          <rect x="475" y="168" width="115" height="18" rx="3" fill="#1e293b" stroke="#f43f5e" stroke-width="1"/>
          <text x="532" y="181" fill="#f43f5e" font-size="10" font-family="monospace" text-anchor="middle">1Mb • 1ms (Q:5)</text>

          <!-- Destination Node n8 (Dst1) -->
          <circle cx="635" cy="195" r="24" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5"/>
          <text x="635" y="199" fill="#f8fafc" font-size="12" font-weight="700" text-anchor="middle">n8</text>
          <text x="635" y="234" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">Dst1 (Sink1)</text>
        </svg>
      `;
    }

    return `
      <div style="padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
        Topology diagram available upon script configuration.
      </div>
    `;
  }

  /* ===================================================================
     VIEW RENDERING CONTROLLER
     =================================================================== */

  function renderView() {
    const data = window.CNC_DATA;
    if (!data) return;

    const mainContainer = document.getElementById('mainContent');
    if (!mainContainer) return;

    // Check if view is setup guide
    if (currentProgramId === 'setup') {
      renderSetupGuide(mainContainer, data.setup);
      updateNavActive();
      return;
    }

    // Check if view is trace guide
    if (currentProgramId === 'trace-guide') {
      renderTraceGuide(mainContainer, data.traceGuide);
      updateNavActive();
      return;
    }

    // Otherwise render standard lab program view
    const prog = data.programs.find(p =>
      p.id === currentProgramId ||
      p.shortId === currentProgramId ||
      ('partA-' + currentProgramId) === p.id ||
      ('partB-' + currentProgramId) === p.id
    ) || data.programs[0];

    const activeFile = prog.files[activeFileIndex] || prog.files[0];

    // Compute line count and highlighted HTML
    const rawLines = activeFile.content.split('\n');
    const lineCount = rawLines.length;
    const highlightedHtml = highlightCode(activeFile.content, activeFile.lang);

    // Build Line Numbers HTML
    let lineNumsHtml = '';
    for (let l = 1; l <= lineCount; l++) {
      lineNumsHtml += `<span class="line-number">${l}</span>`;
    }

    // Build Tabs HTML
    let tabsHtml = '';
    prog.files.forEach((f, idx) => {
      const isActive = idx === activeFileIndex;
      const icon = f.lang === 'tcl' ? '⚡' : f.lang === 'awk' ? '📊' : f.lang === 'python' ? '🐍' : f.lang === 'c' || f.lang === 'cpp' ? '⚙️' : f.lang === 'bash' ? '🐚' : '📄';
      tabsHtml += `
        <button class="code-tab-btn ${isActive ? 'active' : ''}" data-file-idx="${idx}">
          <span class="file-icon">${icon}</span>
          <span>${f.name}</span>
        </button>
      `;
    });

    // Build Execution Commands HTML
    let commandsHtml = '';
    if (prog.execution && prog.execution.commands) {
      prog.execution.commands.forEach(c => {
        commandsHtml += `
          <div class="command-item">
            <div class="command-chip" data-copy="${escapeHtml(c.cmd)}" title="Click to copy command">
              <span>$ ${escapeHtml(c.cmd)}</span>
              <span style="font-size: 0.75rem; opacity: 0.7;">Copy</span>
            </div>
            <div class="command-desc">${escapeHtml(c.desc)}</div>
          </div>
        `;
      });
    }

    // Topology section HTML (rendered ONLY if program has topology)
    let topologySectionHtml = '';
    if (prog.hasTopology && prog.topology) {
      topologySectionHtml = `
      <section class="topology-card">
        <div class="topology-header">
          <div class="topology-title">
            <span>🌐</span>
            <span>Network Topology Diagram</span>
          </div>
          <span style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">
            ${escapeHtml(prog.topology.type)}
          </span>
        </div>
        <div class="topology-svg-container">
          ${renderTopologySvg(prog.shortId || prog.id)}
        </div>
        <div class="topology-legend">
          <div class="legend-item">
            <span class="legend-dot node"></span>
            <span>Host / Traffic Node</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot router"></span>
            <span>Intermediate Switch / Router</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot sink"></span>
            <span>Destination Sink</span>
          </div>
          <div class="legend-item" style="margin-left: auto; font-family: var(--font-mono);">
            <span>${escapeHtml(prog.topology.agents)}</span>
          </div>
        </div>
      </section>
      `;
    }

    // Build View HTML
    mainContainer.innerHTML = `
      <div class="breadcrumbs">
        <span>CNC Laboratory</span>
        <span class="breadcrumb-sep">/</span>
        <span>${escapeHtml(prog.part)}</span>
        <span class="breadcrumb-sep">/</span>
        <span style="color: var(--text-primary); font-weight: 600;">${escapeHtml(prog.num)}</span>
      </div>

      <header class="view-header">
        <h2 class="view-title">${escapeHtml(prog.title)}</h2>
        <div class="view-meta-row">
          <span class="pill-badge">${escapeHtml(prog.num)}</span>
          <span class="pill-badge ${prog.category === 'partB' ? 'emerald' : 'blue'}">${escapeHtml(prog.badge)}</span>
        </div>
        <p class="view-summary">${escapeHtml(prog.summary)}</p>
      </header>

      <!-- CRUCIAL USER REQUIREMENT: README inside each p[number] turned into Question -->
      <section class="question-card ${prog.category === 'partB' ? 'part-b' : 'part-a'}" aria-label="Problem Statement">
        <div class="question-header">
          <div class="question-label" ${prog.category === 'partB' ? 'style="color: var(--accent-emerald);"' : ''}>
            <span style="font-size: 1rem;">🎯</span>
            <span>Problem Statement</span>
          </div>
          <button class="question-copy-btn" id="copyQuestionBtn">
            <span>📋</span>
            <span>Copy Question</span>
          </button>
        </div>
        <div class="question-body">
          <p>${escapeHtml(prog.question)}</p>
        </div>
      </section>

      <!-- TOPOLOGY VISUALIZER (Only if program has topology) -->
      ${topologySectionHtml}

      <!-- CODE VIEWER WITH SYNTAX HIGHLIGHTING -->
      <section class="code-viewer-card">
        <div class="code-viewer-bar">
          <div class="code-tabs">
            ${tabsHtml}
          </div>
          <div class="code-actions">
            <button class="code-action-btn" id="copyCodeBtn" title="Copy code to clipboard">
              <span>📋</span>
              <span>Copy</span>
            </button>
            <button class="code-action-btn" id="downloadCodeBtn" title="Download this file">
              <span>💾</span>
              <span>Download</span>
            </button>
          </div>
        </div>

        <div class="file-meta-strip">
          <span>Path: <strong style="color: var(--text-primary);">${escapeHtml(activeFile.path)}</strong></span>
          <span>${lineCount} lines • ${activeFile.lang.toUpperCase()}</span>
        </div>

        <div class="code-container">
          <div class="line-numbers-col">${lineNumsHtml}</div>
          <div class="code-content-col">${highlightedHtml}</div>
        </div>
      </section>

      <!-- EXECUTION & VERIFICATION GUIDE -->
      <section class="execution-section">
        <div class="info-card">
          <h3 class="info-card-title">
            <span>⚙️</span>
            <span>${prog.category === 'partB' ? 'Execution Steps' : 'Simulation Execution Steps'}</span>
          </h3>
          <div class="command-list">
            ${commandsHtml}
          </div>
          ${prog.execution.tip ? `
            <div class="callout-box">
              <span class="callout-icon">💡</span>
              <div>
                <strong>Important Diagnostic Note:</strong><br/>
                ${escapeHtml(prog.execution.tip)}
              </div>
            </div>
          ` : ''}
        </div>

        <div class="info-card">
          <h3 class="info-card-title">
            <span>🖥️</span>
            <span>Expected Console Output</span>
          </h3>
          <div class="terminal-box">${escapeHtml(prog.execution.expected)}</div>
        </div>
      </section>
    `;

    // Attach Event Handlers
    attachViewEvents(prog, activeFile);
    updateNavActive();
  }

  /* ===================================================================
     SETUP GUIDE & TRACE VIEWER PAGES
     =================================================================== */

  function renderSetupGuide(container, setup) {
    const activeFile = setup.files[activeFileIndex] || setup.files[0];
    const highlightedHtml = highlightCode(activeFile.content, activeFile.lang);
    const lineCount = activeFile.content.split('\n').length;

    let lineNumsHtml = '';
    for (let l = 1; l <= lineCount; l++) {
      lineNumsHtml += `<span class="line-number">${l}</span>`;
    }

    let tabsHtml = '';
    setup.files.forEach((f, idx) => {
      tabsHtml += `
        <button class="code-tab-btn ${idx === activeFileIndex ? 'active' : ''}" data-file-idx="${idx}">
          <span class="file-icon">📜</span>
          <span>${f.name}</span>
        </button>
      `;
    });

    container.innerHTML = `
      <div class="breadcrumbs">
        <span>CNC Laboratory</span>
        <span class="breadcrumb-sep">/</span>
        <span style="color: var(--text-primary); font-weight: 600;">Environment Setup</span>
      </div>

      <header class="view-header">
        <div class="view-badge-row">
          <span class="pill-badge emerald">SETUP & TOOLS</span>
          <span class="pill-badge">Arch Linux / Garuda / Manjaro</span>
        </div>
        <h2 class="view-title">${escapeHtml(setup.title)}</h2>
        <p class="view-summary">${escapeHtml(setup.subtitle)}</p>
      </header>

      <section class="question-card" style="border-left-color: var(--accent-emerald);">
        <div class="question-header">
          <div class="question-label" style="color: var(--accent-emerald);">
            <span>🚀</span>
            <span>Quick Start Installation</span>
          </div>
        </div>
        <div class="question-body" style="font-size: 1rem;">
          <p>Run the automated script <code>script.sh</code> to install AUR helper <code>yay</code>, build legacy <code>gcc48</code>, fetch dependencies (<code>libx11</code>, <code>libxmu</code>), and compile <strong>NS-2.35</strong> and <strong>NAM-1.15</strong>.</p>
        </div>
      </section>

      <section class="code-viewer-card">
        <div class="code-viewer-bar">
          <div class="code-tabs">
            ${tabsHtml}
          </div>
          <div class="code-actions">
            <button class="code-action-btn" id="copyCodeBtn">
              <span>📋</span>
              <span>Copy</span>
            </button>
            <button class="code-action-btn" id="downloadCodeBtn">
              <span>💾</span>
              <span>Download</span>
            </button>
          </div>
        </div>
        <div class="file-meta-strip">
          <span>Path: <strong style="color: var(--text-primary);">${escapeHtml(activeFile.path)}</strong></span>
          <span>${lineCount} lines • ${activeFile.lang.toUpperCase()}</span>
        </div>
        <div class="code-container">
          <div class="line-numbers-col">${lineNumsHtml}</div>
          <div class="code-content-col">${highlightedHtml}</div>
        </div>
      </section>
    `;

    attachViewEvents({ files: setup.files }, activeFile);
  }

  function renderTraceGuide(container, guide) {
    let rowsHtml = '';
    guide.fields.forEach(f => {
      rowsHtml += `
        <tr>
          <td><span class="trace-col-badge">${f.col}</span></td>
          <td><strong style="color: var(--text-primary);">${escapeHtml(f.name)}</strong></td>
          <td>${escapeHtml(f.desc)}</td>
        </tr>
      `;
    });

    container.innerHTML = `
      <div class="breadcrumbs">
        <span>CNC Laboratory</span>
        <span class="breadcrumb-sep">/</span>
        <span style="color: var(--text-primary); font-weight: 600;">Trace File Cheat Sheet</span>
      </div>

      <header class="view-header">
        <div class="view-badge-row">
          <span class="pill-badge blue">REFERENCE GUIDE</span>
          <span class="pill-badge">out.tr Format</span>
        </div>
        <h2 class="view-title">${escapeHtml(guide.title)}</h2>
        <p class="view-summary">${escapeHtml(guide.subtitle)}</p>
      </header>

      <div class="trace-table-container">
        <table class="trace-table">
          <thead>
            <tr>
              <th style="width: 80px;">AWK Col</th>
              <th style="width: 180px;">Field Name</th>
              <th>Description & Standard Values</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>

      <div class="info-card">
        <h3 class="info-card-title">
          <span>💡</span>
          <span>Example Trace Line Breakdown</span>
        </h3>
        <div class="terminal-box">+ 0.5 0 2 tcp 40 ------- 0 0.0 3.0 0 1
│  │   │ │  │   │    │    │  │   │  │ └─ Packet ID: 1
│  │   │ │  │   │    │    │  │   │  └─── Sequence Number: 0
│  │   │ │  │   │    │    │  │   └────── Destination Addr: 3.0
│  │   │ │  │   │    │    │  └────────── Source Addr: 0.0
│  │   │ │  │   │    │    └───────────── Flow ID: 0
│  │   │ │  │   │    └────────────────── Flags: -------
│  │   │ │  │   └─────────────────────── Packet Size: 40 bytes
│  │   │ │  └─────────────────────────── Packet Type ($5): "tcp" (NOT "ftp"!)
│  │   │ └────────────────────────────── To Node ($4): 2
│  │   └──────────────────────────────── From Node ($3): 0
│  └──────────────────────────────────── Time ($2): 0.5 seconds
└─────────────────────────────────────── Event ($1): + (Enqueued)</div>
      </div>
    `;
  }

  /* ===================================================================
     EVENT HANDLERS & INTERACTIONS
     =================================================================== */

  function attachViewEvents(prog, activeFile) {
    // Tab switching
    document.querySelectorAll('.code-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFileIndex = parseInt(btn.getAttribute('data-file-idx'), 10);
        renderView();
      });
    });

    // Copy Question
    const copyQBtn = document.getElementById('copyQuestionBtn');
    if (copyQBtn && prog.question) {
      copyQBtn.addEventListener('click', () => {
        copyToClipboard(prog.question, 'Problem statement copied!', copyQBtn);
      });
    }

    // Copy Code
    const copyCBtn = document.getElementById('copyCodeBtn');
    if (copyCBtn && activeFile) {
      copyCBtn.addEventListener('click', () => {
        copyToClipboard(activeFile.content, `${activeFile.name} copied to clipboard!`, copyCBtn);
      });
    }

    // Download File
    const downloadBtn = document.getElementById('downloadCodeBtn');
    if (downloadBtn && activeFile) {
      downloadBtn.addEventListener('click', () => {
        downloadFile(activeFile.name, activeFile.content);
      });
    }

    // Copy Command Chips
    document.querySelectorAll('.command-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const cmd = chip.getAttribute('data-copy');
        if (cmd) {
          copyToClipboard(cmd, 'Command copied!', chip);
        }
      });
    });
  }

  function copyToClipboard(text, message, btnEl) {
    let origHtml = null;
    if (btnEl) {
      origHtml = btnEl.innerHTML;
      btnEl.innerHTML = '<span style="color: var(--accent-emerald);">✓</span><span style="color: var(--accent-emerald); font-weight: 600;">Copied!</span>';
      btnEl.classList.add('copied');
    }

    const resetBtn = () => {
      if (btnEl && origHtml) {
        setTimeout(() => {
          btnEl.innerHTML = origHtml;
          btnEl.classList.remove('copied');
        }, 1800);
      }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(message || 'Copied to clipboard!');
        resetBtn();
      }).catch(() => {
        fallbackCopy(text, message);
        resetBtn();
      });
    } else {
      fallbackCopy(text, message);
      resetBtn();
    }
  }

  function fallbackCopy(text, message) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast(message || 'Copied to clipboard!');
    } catch (e) {
      showToast('Could not copy automatically');
    }
    document.body.removeChild(ta);
  }

  function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloading ${filename}`);
  }

  function showToast(msg) {
    let toast = document.getElementById('toastNotice');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastNotice';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span class="toast-icon">✓</span><span>${escapeHtml(msg)}</span>`;
    toast.classList.add('show');
    clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  function updateNavActive() {
    document.querySelectorAll('.nav-item-btn').forEach(btn => {
      const id = btn.getAttribute('data-id');
      const matches =
        id === currentProgramId ||
        // short-form 'p1' → matches 'partA-p1' nav buttons
        (id === 'partA-' + currentProgramId) ||
        // short-form 'b-p1' → matches 'partB-p1' nav buttons
        (id === 'partB-' + currentProgramId.replace(/^b-/, ''));
      btn.classList.toggle('active', matches);
    });
  }

  function renderSidebarNav() {
    const data = window.CNC_DATA;
    if (!data || !data.programs) return;

    const partAList = document.getElementById('partANavList');
    const partBList = document.getElementById('partBNavList');

    if (partAList) {
      let aHtml = '';
      data.programs.filter(p => p.category === 'partA').forEach(p => {
        const isAct = p.id === currentProgramId || p.shortId === currentProgramId;
        const badge = p.shortId ? p.shortId.toUpperCase() : p.num.replace('Program ', 'P');
        const displayTitle = p.title.split('&')[0].split('•')[0].trim();
        aHtml += `
          <li>
            <button class="nav-item-btn part-a ${isAct ? 'active' : ''}" data-id="${escapeHtml(p.id)}" data-part="a">
              <div class="nav-item-left">
                <span class="nav-badge">${escapeHtml(badge)}</span>
                <span>${escapeHtml(displayTitle)}</span>
              </div>
              <span style="font-size: 0.72rem; color: var(--text-muted);">${p.files.length} files</span>
            </button>
          </li>
        `;
      });
      partAList.innerHTML = aHtml;
    }

    if (partBList) {
      let bHtml = '';
      data.programs.filter(p => p.category === 'partB').forEach(p => {
        const isAct = p.id === currentProgramId || p.shortId === currentProgramId;
        const badge = p.num.replace('Program ', 'P');
        const langSummary = p.files.some(f => f.lang === 'c') ? `${p.files.length} C` : `${p.files.length} py`;
        let displayTitle = p.title;
        if (displayTitle.includes('(')) {
          displayTitle = displayTitle.split('(')[0].trim();
        }
        bHtml += `
          <li>
            <button class="nav-item-btn part-b ${isAct ? 'active' : ''}" data-id="${escapeHtml(p.id)}" data-part="b">
              <div class="nav-item-left">
                <span class="nav-badge" style="color: #10b981; border-color: rgba(16, 185, 129, 0.3);">${escapeHtml(badge)}</span>
                <span>${escapeHtml(displayTitle)}</span>
              </div>
              <span style="font-size: 0.72rem; color: var(--text-muted);">${langSummary}</span>
            </button>
          </li>
        `;
      });
      partBList.innerHTML = bHtml;
    }
  }

  /* ===================================================================
     INITIALIZATION & GLOBAL LISTENERS
     =================================================================== */

  function initApp() {
    // Dynamic sidebar generation from data catalog
    renderSidebarNav();

    const sidebar = document.getElementById('appSidebar');
    const overlay = document.getElementById('sidebarOverlay');

    function openSidebar() {
      sidebar?.classList.add('open');
      overlay?.classList.add('show');
      document.body.classList.add('sidebar-open');
    }

    function closeSidebar() {
      sidebar?.classList.remove('open');
      overlay?.classList.remove('show');
      document.body.classList.remove('sidebar-open');
    }

    // Mobile drawer toggle buttons
    document.getElementById('mobileMenuBtn')?.addEventListener('click', openSidebar);
    document.getElementById('sidebarCloseBtn')?.addEventListener('click', closeSidebar);
    overlay?.addEventListener('click', closeSidebar);

    // Mobile search button in topbar opens drawer and focuses search
    document.getElementById('mobileSearchBtn')?.addEventListener('click', () => {
      openSidebar();
      setTimeout(() => {
        document.getElementById('sidebarSearch')?.focus();
      }, 180);
    });

    // Navigation Clicks (delegated to support dynamically rendered items)
    sidebar?.addEventListener('click', (e) => {
      const btn = e.target.closest('.nav-item-btn');
      if (!btn) return;
      const id = btn.getAttribute('data-id');
      if (id) {
        currentProgramId = id;
        activeFileIndex = 0;
        location.hash = id;
        renderView();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        closeSidebar();
      }
    });

    // In-drawer live filter search
    const sidebarSearchInput = document.getElementById('sidebarSearch');
    if (sidebarSearchInput) {
      sidebarSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const allNavItems = sidebar?.querySelectorAll('.nav-list li');
        if (!allNavItems) return;

        allNavItems.forEach(li => {
          const btn = li.querySelector('.nav-item-btn');
          if (!btn) return;
          const text = btn.textContent.toLowerCase();
          const match = !query || text.includes(query);
          li.style.display = match ? '' : 'none';
        });
      });
    }

    // Theme Toggle
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        activeTheme = activeTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', activeTheme);
        localStorage.setItem('cnc_theme', activeTheme);
        themeBtn.querySelector('.theme-text').textContent = activeTheme === 'dark' ? 'Light' : 'Dark';
      });
    }

    // Global Search (Desktop)
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) return;

        const data = window.CNC_DATA;
        if (!data) return;

        const match = data.programs.find(p =>
          p.title.toLowerCase().includes(query) ||
          p.question.toLowerCase().includes(query) ||
          p.files.some(f => f.content.toLowerCase().includes(query))
        );

        if (match && match.id !== currentProgramId) {
          currentProgramId = match.id;
          activeFileIndex = 0;
          renderView();
        }
      });
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      // Escape closes mobile drawer
      if (e.key === 'Escape' && sidebar?.classList.contains('open')) {
        closeSidebar();
      }
      // Focus search on '/'
      if (e.key === '/' && document.activeElement !== searchInput && document.activeElement !== sidebarSearchInput) {
        e.preventDefault();
        searchInput?.focus();
      }
      // Jump to p1, p2, p3, p4 on numbers 1, 2, 3, 4
      if (!['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        if (e.key === '1') { currentProgramId = 'p1'; activeFileIndex = 0; renderView(); }
        if (e.key === '2') { currentProgramId = 'p2'; activeFileIndex = 0; renderView(); }
        if (e.key === '3') { currentProgramId = 'p3'; activeFileIndex = 0; renderView(); }
        if (e.key === '4') { currentProgramId = 'p4'; activeFileIndex = 0; renderView(); }
        if (e.key === 't' || e.key === 'T') { themeBtn?.click(); }
      }
    });

    // Check Hash on Load
    const hash = window.location.hash.replace('#', '');
    if (hash && (hash.startsWith('p') || hash.startsWith('part') || hash.startsWith('b-') || hash === 'setup' || hash === 'trace-guide')) {
      currentProgramId = hash;
    }

    // Initial Render
    renderView();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();

