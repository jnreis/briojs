let ol = "brio", Pt = "$", ws = "$store", Is = "$tools", Me = "after", Ns = "append", Ct = "array", pe = "attr", ui = "Attribute", H = "b-", de = "b-if", $s = "b-ignore", zt = "b-save", El = "b-show", Ze = "before", Ml = "begin", xr = "body", ul = "boolean", kr = "cache", Ps = "can only be used on", Cs = "Cannot ", yt = "checkbox", Rt = "checked", Lr = "class", Ui = "closest", Ti = "composi", pi = "content", ms = "Content", et = "create", Lt = "data", Sl = "debounce", Ds = "detail", ds = "define", Y = "delete", nt = "directive", Gl = "disconnect", Rl = "display", yi = "document", gs = "each", Ye = "element", Wt = "end", Fi = "entries", Bi = "error", ct = "evalEffect", Yi = "event", xs = "EventListener", ks = "exit", hi = "ctxArgs", ot = "get", Ls = "head", zi = "href", mt = "html", Ms = "HTML", st = "hydrate", Ot = "index", Dl = "inner", ll = "insert", Al = "Invalid", Kl = "length", Mt = "mask", Hs = "message", Mr = "method", ke = "must be", He = `
`, wt = "newValue", vs = "name", Us = "Node", De = "nodes", Ol = "not found.", rt = null, oe = "number", il = "object", Fs = "observe", Gt = "oldValue", Si = "on-", Gi = Si + "enter", Ki = Si + ks, ji = Si + "resize", Bs = "once", Ri = "operation", ne = "options", Ai = "outer", Dt = "parent", Wi = "patch", Hr = "pause", vr = "post", Ur = "prepend", Ys = "prevent", zs = "Propert", Et = zs + "y", Ie = "props", Gs = "put", qi = "radio", We = "remove", Ks = "replace", Oi = "requires", tt = "route", b = "script", qe = "skip", V = "select", me = "state", js = "start", _i = "storage", Qe = "string", j = "style", Ws = "teleport", ie = "template", Ae = "text", Xi = "throttle", wi = "tion", Fr = "toString", _l = "tokens", _t = "transition", qs = "type", ye, jl = "update", D = "value", Ii = "With", Br = "add" + xs, Wl = Pt + Lt, Jt = Pt + gs, ql = Pt + Ie, ze = H + Lt, Yr = H + gs, Xs = H + mt, Vs = H + ie, zr = H + Ae, Gr = kr + "Exp", Kr = Lr + "List", jr = "clone" + Us, wl = Ti + "ng", Wr = Ti + wi + js, qr = Ti + wi + Wt, Xr = et + "Comment", Vr = et + "Element", Xl = ds + Et, Qr = ds + zs + "ies", Zt = "de" + st, Vi = Y + Et, Qs = nt + "s", Jr = "ends" + Ii, dl = "func" + wi, Zr = ot + ui, br = ot + Et + "Value", ef = ot + Et + "Priority", Qi = Ls + "ers", fe = Dl + Ms, X = "in" + Gs, tf = ll + "AdjacentHTML", Vl = Mt + "s", Js = Mt + "Token", Ql = Js + "s", Zs = "of " + qs, be = Ai + Ms, bs = "Own" + Et, lf = Dt + Us, Hl = "path" + vs, sf = Ys + "Default", er = "proto" + qs, rf = We + ui, ff = We + xs, af = We + Et, Ni = Ks + Ii, Ji = tt + "Rule", vl = V + "ionStart", nf = "set" + ui, cf = "set" + Et, of = js + "s" + Ii, Ef = _i + "Area", Fe = "tar" + ot, At = Ae + "area", lt = Ae + ms, uf = "async" + dl, tr = ot + bs + "Descriptor", Tf = tr + "s", pf = "has" + bs, lr = (e, t, l, i) => `the ${e} ${t} ${Oi} ${l}, ` + ir(i), ir = (e) => `but got ${e} instead.`, L = (e, ...t) => e.push(...t), $i = (e, t) => e.sort(t), re = (e, t) => e.join(t), P = (e, t) => e.forEach(t), Q = (e, t, l) => e.map(t, l), It = (e, t, l) => e.filter(t, l), sr = (e, t, l) => e.find(t, l), rr = (e, t, l) => e.every(t, l), yf = (e, t, l) => e.indexOf(t, l), fr = (e, t) => t[1] - e[1], Ge = (e) => Array.from(e), Zi = (e, t = 0) => Q(Ge({ [Kl]: e }), (l, i) => t + i), W = (e) => e.trim(), ge = (e) => e.toLowerCase(), q = (e, t, l) => e.split(t, l), Pi = (e, t) => e.match(t), hf = (e) => e.toUpperCase(), Sf = (e) => hf(e[0]) + Te(e, 1), Rf = (e) => ge(e[0]) + Te(e, 1), Be = (e, t, l) => e[of](t, l), bi = (e, t, l) => e[Jr](t, l), he = (e, t) => t.test(e), ee = (e, t, l) => e[Ks](t, l), Jl = (e, t, l) => {
  for (; he(e, t); )
    e = ee(e, t, l);
  return e;
}, Af = (e) => he(e, /^\d+$/), Of = (e) => he(e, /^(\w|\s|\.|\$|`|'|"|(\[(.|\s)+?\]))*;?$/g) && !Be(e, Y + " "), ar = (e) => he(W(e), /^((async\s+)?function\s*\([^)]*\)\s*{[^}]*}|(async\s*)?(?:\([^()]*\)|[$\w]+)\s*=>)/), _f = (e) => Rf(re(Q(q(e, "-"), Sf), "")), nr = (e) => JSON.stringify(e), Ci = (e, t) => {
  try {
    e = JSON.parse(e, t);
  } catch {
  }
  return e;
}, mi = (e) => "`" + ee(e, /`/g, "\\`") + "`", we = (...e) => re(e, " "), dt = (e) => ge(Te(Ce[er][Fr].call(e), 8, -1)), ut = (e, t) => dt(e) === t, ae = (e) => e === rt, ft = (e) => e === ye, Pe = (e) => ut(e, il), B = (e) => ut(e, Ct), sl = (e) => wf(e) || If(e), wf = (e) => ut(e, dl), If = (e) => ut(e, uf), se = (e) => ut(e, Qe), Il = (e) => ut(e, oe) && isFinite(e), Nf = (e) => ut(e, ul), $f = (e) => Ht(e, cr), Ht = (e, t) => e instanceof t, gt = (e) => Ht(e, Node), Pf = (e) => Ht(e, Text), Ke = (e) => Ht(e, HTMLElement), Zl = (e) => Ht(e, Map), Cf = (e) => Ht(e, Set), Le = window, Ce = Object, Ft = Reflect, Tl = location, vt = Le[yi], mf = Symbol, cr = RegExp, te = (e, t) => Ce[er][pf].call(e, t), Ee = (e, t, l) => {
  let i = l;
  try {
    i = t in e ? e[t] : l;
  } catch {
  }
  return i;
}, Xe = (e, t) => delete e[t], Df = [
  ["w", "writable"],
  ["e", "enumerable"],
  ["c", "configurable"]
], J = (e, t, l = ye, i = {}) => {
  let r = "";
  se(i) && (r = i, i = {}), P(Df, ([c, n]) => {
    te(i, c) ? i[n] = i[c] : te(i, n) || (i[n] = !v(r, c));
  }), i[D] = l, Ce[Xl](e, t, i);
}, qt = (e) => d(ue(e)), ue = (e) => Ce.keys(e), df = (e = rt) => Ce[et](e), gf = (e, t = {}) => {
  const l = df(e);
  return Ce[Qr](
    l,
    Ce[Tf](t)
  ), l;
}, xf = (e, t, l = Ce) => l[tr](e, t), kf = (e) => Ce.getPrototypeOf(e), Di = (e, t = {}) => {
  P(ue(e), (l) => {
    J(e, l, e[l], t);
  });
}, di = (e) => P(ue(e), (t) => {
  Xe(e, t);
}), Se = (e = ye) => new Map(e), je = (e = ye) => new Set(e), or = (e, t) => new cr(e, t), Xt = (e, t) => {
  if (e === t) return e;
  if (B(e) && B(t)) {
    for (; d(e) > d(t); ) e.pop();
    for (let l = 0; l < d(t); l++)
      l < d(e) ? e[l] = Xt(e[l], t[l]) : e.push(ve(t[l]));
  } else if (Zl(e) && Zl(t)) {
    let l = Se(e);
    e.clear();
    for (let [i, r] of Tt(t))
      e.set(i, l.has(i) ? Xt(l.get(i), r) : ve(r));
  } else if (e instanceof Set && t instanceof Set) {
    e.clear();
    for (let l of t)
      e.add(l);
  } else if (Pe(e) && Pe(t)) {
    let l = { ...e };
    di(e);
    for (let i in t)
      te(t, i) && (e[i] = te(l, i) ? Xt(l[i], t[i]) : ve(t[i]));
  } else
    return t;
  return e;
}, ve = (e) => {
  let t = e;
  if (Pe(e)) {
    let l = {};
    for (let i in e)
      te(e, i) && (l[i] = ve(e[i]));
    t = l;
  }
  return B(e) && (t = Q(e, ve)), Zl(e) && (t = Se(Q(Ge(Tt(e)), ([l, i]) => [l, ve(i)]))), Cf(e) && (t = je(Q(Ge(e), ve))), t;
}, v = (e, t, l) => e.includes(t, l), Tt = (e) => Pe(e) ? Ce[Fi](e) : e[Fi](), Te = (e, t, l) => e.slice(t, l), d = (e) => ft(e[Kl]) ? e.size : e[Kl], xe = (e, t = 0) => setTimeout(e, t), Lf = (e) => {
  clearTimeout(e);
}, Nl = (e, t) => {
  let l;
  return (...i) => {
    Lf(l), l = xe(() => e(...i), t);
  };
}, Mf = (e, t) => {
  let l = 0;
  return (...i) => {
    let r = Date.now();
    if (!(r - l < t))
      return l = r, e(...i);
  };
}, es = {}, ts = (e) => Te(ee(crypto.randomUUID(), /-/g, ""), 0, e - 1), rl = (e = 8) => {
  let t = ts(e);
  for (; t in es; ) t = ts(d(t) + 1);
  return es[t] = !0, "b" + t;
}, Er = (e, ...t) => console[e]("Brio.js", ...t), gl = (...e) => Er("warn", `warn:
`, ...e), z = (...e) => Er(Bi, `detected an ${Bi}:
`, ...e), xt = (e, t = vt) => Ge(t.querySelectorAll(e)), K = (e, t = vt) => se(e) ? xt(e, t)[0] : e, at = (e, t, ...l) => e[t](...l), Hf = (e, t, l) => {
  t == fe || t == be ? e[t] = l : e[tf](t, l);
}, bl = (e) => e[jr](!0), ur = (e, t) => P(Ge(e.attributes), ({ name: l, value: i }) => t(l, i)), Nt = (e) => e[We](), bt = (e) => e[lf], Tr = (e) => W(e[lt] || ""), Je = (e) => [...e.childNodes], G = (e, t) => e[Zr](t), gi = (e, t, l, i) => {
  i && (e[i] = l), e[nf](t, l);
}, fl = (e, t) => e[rf](t), vf = (e, ...t) => e[Kr].add(...t), ls = requestAnimationFrame, Ul = (e) => ls(() => ls(e)), pr = (e, t) => vt[Vr](e, t), yr = (e) => vt[Xr](e), Uf = (e) => new DOMParser().parseFromString(e, Ae + "/" + mt), $e = (e) => ge(e.tagName || ""), Ne = (e, t, l, i) => (se(e) && (e = K(e)), e[Br](t, l, i), () => e[ff](t, l)), it = (e, t, l) => K(e).dispatchEvent(new CustomEvent(ge(ee(t, /[^a-z\d]/gi, "")), {
  bubbles: !0,
  cancelable: !0,
  [Ds]: l
})), ei = async (e, t) => {
  if (await t(e))
    for (let l of Je(e))
      await ei(l, t);
}, Ff = (e) => e[Fe][wl] = !0, Bf = (e) => {
  let t = e[Fe];
  t[wl] && (t[wl] = !1, it(t, X));
}, hr = (e) => Le.getComputedStyle(e), Yf = (e) => {
  let t = hr(e);
  return !(!bt(e) || t[Rl] == "none" || t.visibility == "hidden" || t.opacity == "0");
}, zf = (e, t) => new URL(e, t), pl = (e = "", t = zi) => zf(e, Tl[zi])[t], Sr = (e) => v([D, Rt, V + "ed"], e), Gf = (e) => ee(ee(e, /[^a-z0-9_-]/gi, ""), /^[^a-z_]+/i, ""), Rr = (e) => {
  let t = {};
  for (let l of e)
    t[l] = [e[br](l), e[ef](l)];
  return t;
}, is = (e) => {
  let t = {}, l = {};
  for (let i in e)
    (Be(i, _t) ? t : l)[i] = e[i];
  return [t, l];
}, ss = (e) => {
  for (let t of document.styleSheets)
    try {
      for (let l of t.cssRules)
        if (l.selectorText == e)
          return Rr(l.style);
    } catch {
    }
}, Kf = (e, t, l, i) => {
  e[j][cf](t, l, i);
}, jf = (e, t) => {
  e[j][af](t);
}, ce = (e, ...t) => {
  for (let l of t)
    for (let i in l)
      Kf(e, i, ...l[i]);
}, _e = (e, ...t) => {
  for (let l of t)
    for (let i in l)
      jf(e, i);
}, Wf = (e, t, l) => async (i, r, c, n) => {
  let a = r == Ai ? be : r == Dl ? fe : r == Ae ? lt : r == Ze ? Ze + Ml : r == "first" ? Me + Ml : r == "last" ? Ze + Wt : r == Me ? Me + Wt : r, f = "$dom." + ll, s = K(c), o = K(Ls), E = K(xr);
  if (!s) return z(f, Ye, Ol);
  (o == s || E == s) && (a = fe);
  let u = K(mt) == s, O = a == lt, S = O || a == fe, h = a == be, p = S ? s : bt(s);
  if (!p && !u) return z(f, Dt, Ye, Ol);
  i = await i, i in l && (i = l[i]());
  let C = gt(i) ? i : Uf(i), I = Ee(n, V);
  I && (i = K(I, C)), gt(i) && (i = i[be]), (h || u) && t(s, !1), S && P(Je(s), (R) => t(R));
  let M = je(Je(s));
  p && P(Je(p), (R) => M.add(R));
  let U = (R) => It(Je(R), (F) => !M.has(F)), x = [];
  u ? (s[fe] = K(mt, C)[fe], x = [s, ...xt(b, s)]) : S ? (s[O ? lt : fe] = i, x = Je(s)) : h ? (s[be] = i, x = U(p)) : (Hf(s, a, i), x = U(a == Ze + Ml || a == Me + Wt ? p : s)), $i(x, (R, F) => {
    let _ = $e(R) == j, $ = $e(F) == j;
    return _ && !$ ? -1 : $ && !_ ? 1 : 0;
  }), P(x, (R) => {
    if (
      // is script element
      $e(R) == b && // is not b-script
      ae(G(R, H + b)) && // should load: !(b-load-once attribute AND script already loaded)
      !(!ae(G(R, "b-load-" + Bs)) && Pr.has(G(R, "src")))
    ) {
      let F = pr(b);
      ur(R, (_, $) => gi(F, _, $, Sr(_) && _)), F[fe] = R[fe], at(R, Ni, F);
    }
  }), Ee(n, st, !0) && P(x, (R) => e(R, s));
  let le = Ee(n, "then");
  le && await le(x);
}, Fl = (e, t = "", l = "") => {
  let i = t == Lt ? FormData : URLSearchParams, r = new i(), c = (n, a = "") => {
    Pe(n) || B(n) ? P(Tt(n), ([f, s]) => {
      let o = a ? `${a}[${f}]` : f;
      c(s, o);
    }) : r[Ns](a, n);
  };
  return c(e, l), r;
}, Bt = (e) => async (t, l, i = {}) => {
  let r = "status", c = ms + "-Type", n = Ee(i, "parser");
  if (Pe(l)) {
    let a = i[Qi] || {}, f = sr(ue(a), (o) => ge(o) == ge(c)), s = ge(a[f] || "");
    Xe(a, f), e == ot || e == Y ? (t += Fl(l), l = ye) : bi(s, "json") ? (l = nr(l), a[c] = "application/json") : bi(s, "form-data") ? l = Fl(l, Lt) : l = Fl(l), i[Qi] = a;
  }
  try {
    let a = await fetch(t, { ...i, [Mr]: e, body: l }), f = await a[n || Ae]();
    if (!n)
      try {
        f = Ci(f);
      } catch {
      }
    if (!a.ok) {
      let s = new Error(`HTTP ${a[r]}! Status text: ` + a.statusText);
      throw s.response = a, s[pi] = f, s;
    }
    return f;
  } catch (a) {
    throw a;
  }
}, $l = {
  get: Bt(ot),
  post: Bt(vr),
  put: Bt(Gs),
  [Wi]: Bt(Wi),
  [Y]: Bt(Y)
}, qf = (e, t, l) => [
  // Set a route
  (i, r) => {
    if (sl(r)) {
      i = pl(i, Hl);
      let c = It(q(i, "/"), W), n = d(c) - 1, a = e;
      P(c, (f, s) => {
        f in a || (a[f] = {}), a = a[f], s == n && (a[jt] = r);
      });
    } else z(Cs, "set route without a", tt, dl, He, i);
  },
  /**
   * Route to a path.
   * 
   * Notes:
   * - If the path matches a route, the route function is called with the params and path. Otherwise, the page is fetched and swapped.
   * - If the path is not on the same origin, a redirect is performed.
   * 
   * @returns `null` if redirected, `true` if the route was found, or `false` if the route was not found
   */
  (i) => {
    if (!Be(pl(i), Tl.origin))
      return Tl.href = i, rt;
    i = pl(i, Hl);
    let r = It(q(i, "/"), W), c = e, n = {}, a = 0;
    for (let f of r) {
      if (a = 0, f in c && !Be(f, ":"))
        c = c[f], a = 1;
      else for (let s of ue(c))
        if (Be(s, ":")) {
          let [o, E] = It(q(s, ":"), W);
          if (!E || E && E in t && t[E](f)) {
            let u = n[o];
            u ? B(u) ? L(u, f) : n[o] = [u, f] : n[o] = f, c = c[s], a = 1;
            break;
          }
        }
      if (!a) break;
    }
    return a = a && c[jt] ? 1 : 0, a ? c[jt]({
      params: n,
      path: i,
      [We]: () => Xe(c, jt)
    }) : l($l.get(i), Ai, mt), i != Tl[Hl] && history.pushState(rt, "", i), !!a;
  }
];
const Xf = je([
  // ECMAScript reserved keywords
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "export",
  "extends",
  "finally",
  "for",
  "function",
  "if",
  "import",
  "in",
  "instanceof",
  "let",
  "new",
  "return",
  "super",
  "switch",
  "this",
  "throw",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
  "enum",
  "await",
  "implements",
  "package",
  "protected",
  "interface",
  "private",
  "public",
  "static",
  "null",
  "true",
  "false"
]);
let ti = /^[a-z_$][\w$]*$/i, Vf = (e) => {
  let t = /[a-z_$][\w$]*/gi, l = je(), i = [
    /\b(?:var|let|const)\s+([a-z_$][\w$]*)/gi,
    // variable declarations
    /\bfunction\s+([a-z_$][\w$]*)/gi,
    // function declarations
    /\bclass\s+([a-z_$][\w$]*)/gi,
    // class declarations
    /\bimport\s+([a-z_$][\w$]*)/gi,
    // import statements
    /\bfunction\s*[^(]*\(([^)]*)\)/g,
    // function parameters
    /\(([^)]*)\)\s*=>/g,
    // arrow function parameters (parentheses)
    /\b([a-z_$][\w$]*)\s*=>/gi
    // arrow function parameters (single param without parentheses)
  ];
  for (let E of i) {
    let u;
    for (; (u = E.exec(e)) !== null; ) {
      let O = u[1];
      if (O) {
        let S = Q(q(O, ","), (h) => ee(W(h), /=.*$/, ""));
        for (let h of S)
          h.match(ti) && l.add(h);
      }
    }
  }
  let r = [], c = /(['"`])(?:\\[\s\S]|(?!\1)[^\\])*\1/g, n = /\$\{([\s\S]*?)\}/g, a;
  for (; (a = c.exec(e)) !== null; ) {
    let E = a[1], u = a[Ot], O = u + d(a[0]);
    if (E === "`") {
      let S = a[0], h = a[Ot], p = 0, C;
      for (; (C = n.exec(S)) !== null; ) {
        let I = C[Ot] + 2, M = I + d(C[0]) - 3;
        I > p && L(r, [
          h + p,
          h + I
        ]), p = M;
      }
      p < d(S) && L(r, [
        h + p,
        h + d(S)
      ]);
    } else
      L(r, [u, O]);
  }
  let f = je(), s = /\b([a-z_$][\w$]*)\s*:/gi;
  for (; (a = s.exec(e)) !== null; )
    f.add(a[1]);
  let o = [];
  for (; (a = t.exec(e)) !== null; ) {
    let E = a[0], u = a[Ot], O = e[u - 1];
    Xf.has(E) || l.has(E) || O === "." || f.has(E) || r.some(([S, h]) => u >= S && u < h) || L(o, [
      E,
      u,
      // start index of the variable
      u + d(E)
      // end index of the variable
    ]);
  }
  return o;
}, Ar = (e, t) => {
  let l = Vf(t), i = "", r = 0, c = e.ctx;
  for (let [n, a, f] of l)
    if (!(n in c)) {
      for (let s of [Jt, "$uid", Wl, ql, ws, Is])
        if (c[s] && n in c[s]) {
          i += t.slice(r, a) + `${s}.${n}`, r = f;
          break;
        }
    }
  return i + t.slice(r);
}, Qf = (e) => xi(({ prop: t, state: l }) => (tl(l)[qe].add(t), e)), li = !1, ii = [], Or = (e) => (ii = [], li = !0, e({}), li = !1, [...ii]), _r = (e) => {
  let t = Or(e), l = d(t);
  if (l) {
    let [i, r] = t[l - 1];
    return (c) => ft(c) ? i[r] : i[r] = c;
  }
}, Re = (e, t) => {
  if (!rs(e) || el(e)) return e;
  let l = Ee(t, Dt, rt);
  t = { [Dt]: l };
  let i = {
    get(a, f) {
      return li && (te(a, f) || !(f in a)) && L(ii, [r, f]), Ft.get(a, f, r);
    },
    set(a, f, s) {
      f in a || J(a, f);
      let o = r[f];
      if (o === s) return !0;
      let E = tl(r), u = {
        [Fe]: a,
        [me]: r,
        prop: f,
        [Gt]: o
        // [NEW_VALUE]: newValue,
        // [OPERATION]: UNDEFINED,
      };
      Di(u, "wc"), Kt.has(s) && (Kt[Y](s), s = s(u)), c.has(f) || (s = Re(s)), u[wt] = s, Jf(u);
      let O = Ft.set(a, f, s, r);
      return fs(E, u), O;
    },
    [Vi](a, f) {
      let s = a[f], o = Ft[Vi](a, f);
      return fs(tl(r), {
        [Fe]: a,
        [me]: r,
        prop: f,
        [Gt]: s,
        [wt]: ye,
        [Ri]: Y
      }), o;
    },
    [Xl](a, f, s) {
      let o = s[D], E = r[f];
      return Kt.has(o) && (s[D] = o({ [me]: r, prop: f, [wt]: o, [Gt]: E })), !c.has(f) && D in s && (s[D] = Re(s[D])), Ft[Xl](a, f, s);
    }
  };
  const r = new Proxy(el(l) ? gf(l, e) : e, i), c = je();
  let n = {
    // [PARENT]: parent,
    // [TARGET]: target,
    // proxied,
    [me]: Se(),
    [Ie]: {},
    skip: c
    // refs: [],
    // [ON_SET]: {},
  };
  xl.set(r, n);
  for (let a in e) {
    let f = e[a];
    Kt.has(f) && (f = f({
      [Fe]: e,
      [me]: r,
      prop: a,
      [Gt]: ye
    })), !c.has(a) && rs(f) && Ft.set(e, a, f, r);
  }
  return r;
}, rs = (e) => B(e) || Pe(e), fs = (e, t) => {
  let l = Se(), i = e[Ie][t.prop];
  i && P(i, (c, n) => l.set(n, c)), P(e[me], (c, n) => l.set(n, c));
  let r = Ge(l);
  $i(r, fr);
  for (let [c] of r) c(t);
}, Jf = (e) => {
  e[Ri] = ft(e[Gt]) ? et : ft(e[wt]) ? Y : jl;
}, wr = "getItem", Ir = "setItem", si = Se(), Zf = (e) => {
  let t = kf(e);
  return t && te(t, wr) && te(t, Ir);
}, ri = (e, t) => Ci(e[wr](t) || ""), as = (e, t, l) => e[Ir](t, nr(l)), ns = (e) => "_b_" + e, Nr = (e, t, l) => Zf(e) ? (l && (l = ns(l), te(e, l) && (t = ri(e, l))), xi(({ state: r, prop: c }) => (si.set(l, [r, c, e]), l = l || ns(c), te(e, l) ? t = ri(e, l) : as(e, l, t), xe(() => Qt(r, c, () => {
  as(e, l, r[c]);
})), t))) : z(Al, _i, il), bf = (e) => {
  if (si.has(e.key)) {
    let [t, l, i] = si.get(e.key);
    i === e[Ef] && (t[l] = ri(i, e.key));
  }
}, Vt = (e, t, l = 0) => {
  let i = [], r = Or(t || e);
  return P(r, ([c, n]) => {
    L(i, $r(c, n, e, l));
  }), t && e({}), () => P(i, (c) => c());
}, Qt = (e, t, l, i = 0) => {
  let r;
  return el(e) ? /*hasProp(proxied, prop as string)*/ t || t === 0 ? r = $r(e, t, l, i) : r = ea(e, l, i) : (z(Cs + `watch non-${me} ${il}/${Ct}.`), r = () => {
  }), r;
}, xl = Se(), Kt = je(), xi = (e) => Kt.add(e) && e, el = (e) => xl.has(e), tl = (e) => xl.get(e), fi = (e) => xl[Y](e), ea = (e, t, l = 0) => {
  if (el(e)) {
    let i = tl(e)[me];
    return i.set(t, l), () => i[Y](t);
  }
}, $r = (e, t, l, i = 0) => {
  let r = tl(e)[Ie];
  return r[t] || (r[t] = Se()), r[t].set(l, i), () => r[t][Y](l);
};
J(Re, "persist", (e, t) => Nr(localStorage, e, t), "wc");
J(Re, "session", (e, t) => Nr(sessionStorage, e, t), "wc");
J(Re, "init", xi, "wc");
J(Re, qe, Qf, "wc");
let Pl = (e, t, l = !0) => new Function(e, l ? `return(${t})` : t), ta = (e, t) => t ? mi(e) : $t(e), kl = (e, t = "", l = !0) => (Of(e) && !l && (e += `(${t})`), ar(e) || (e = ta(e, l == Ae), e = `(${t})=>` + (l ? `(${e})` : `{${e}}`)), e), cs = (e, t, l) => {
  let i = e.get(t);
  return i && i[l];
}, la = (e) => [
  // Adds a hook to a target
  (t, l, i, r = 0) => {
    sl(i) && (e.has(t) || e.set(t, {}), e.get(t)[l] || (e.get(t)[l] = Se()), cs(e, t, l).set(i, r));
  },
  // Calls all the functions under a hook name on a target by priority
  async (t, l, i) => {
    let r = cs(e, t, l);
    if (r && d(r)) {
      let c = Ge(r);
      $i(c, fr);
      let n = -1, a = !0, f = async () => {
        if (n++, a = !0, n < d(c)) {
          let s = n;
          await c[s][0](
            /** Contextual data, if any */
            i,
            {
              /** Call the next function */
              play: f,
              /** Disable the auto-run feature and choose when/if to call the next function */
              [Hr]: () => a = !1,
              /** Remove the current function */
              [We]: () => r[Y](c[s][0])
            }
          ), a && await f();
        }
      };
      await f();
    }
  }
], Bl = "required", os = "matches", Es = "\\p{L}", ia = "\\p{Nd}", sa = or(Jl(Jl("^(?!.*\\.{2})[w._%+-]+@(?:[w](?:[w-]*[w])?\\.)+[l]{2,}$", /w/, Es + ia), /l/, Es), "u"), ra = (e) => {
  let t = {}, l = {};
  e || (e = {});
  let i = (s, o, E) => {
    let u = !1;
    return (se(s) || B(s)) && (u = E ? d(s) >= o : d(s) <= o), Il(s) && (u = E ? s >= o : s <= o), u;
  }, r = {
    [Bl]: (s) => !!s || s === 0,
    min: (s, o) => i(s, o, !0),
    max: (s, o) => i(s, o, !1),
    email: (s) => se(s) && he(s, sa),
    same: (s, o, E) => s === E[o],
    in: (s, o) => B(o) && v(o, s),
    [os]: (s, o) => se(s) && he(s, o),
    type: (s, o) => r.in(dt(s), B(o) ? o : [o])
  }, c = {
    [Bl]: (s) => we(s, "is", Bl + "."),
    min: (s, o) => we(s, ke, "at least", o + "."),
    max: (s, o) => we(s, ke, "at most", o + "."),
    email: (s) => we(s, ke, "a valid email."),
    same: (s, o) => we(s, "must match", o + "."),
    in: (s, o) => we(s, ke, "equal to", re(o, " or ") + "."),
    [os]: (s) => s + " has an invalid format.",
    type: (s, o) => we(s, ke, Zs, (B(o) ? re(o, " or ") : o) + ".")
  };
  return {
    prop: (s, o) => {
      t[s] = o;
    },
    rule: (s, o, E) => {
      r[s] = o, E && (c[s] = E);
    },
    validate: () => {
      di(l);
      for (let [s, o] of Tt(t)) {
        let E = e[s];
        for (let u of o) {
          let O = "", S = "", h = "";
          se(u) ? O = u : Pe(u) && (O = u[vs], S = u[D], h = u[Hs]);
          let p = r[O];
          if (!p) {
            gl("Unknown rule: " + O);
            continue;
          }
          p(E, S, e) || (l[s] || (l[s] = []), h ? L(l[s], h) : L(l[s], c[O](s, S, e) || s + " is invalid."));
        }
      }
      return !qt(l);
    },
    errors: l
  };
}, jt = mf(ol), ki = {}, Pr = je(), sn = () => {
  let e = (y) => u.get(y), t = (y, A = () => !0) => {
    let T = y ? bt(y) : rt;
    for (; T; ) {
      let N = e(T);
      if (N && A(N)) return N;
      T = bt(T);
    }
  }, l = (y, A) => {
    let T = e(y);
    if (!T) {
      let N = A ? e(A) : t(A || y);
      T = {
        // Local context
        // @ts-ignore
        ctx: { ...Z },
        // A reference to the element. Convenience for internal use.
        el: y,
        parent: N,
        // UID context
        uid: Ee(N, "uid", {}),
        /** Attributes or directives */
        attr: {},
        /** Cleanup functions */
        cFns: [],
        ...m,
        ...Ut
      };
      for (let w in U) {
        let g = U[w](T, N);
        g && J(T.ctx, w, g, "c");
      }
      u.set(y, T), T[ne] = fa(T, H + ne)();
    }
    return T;
  }, i = (y, A, T, N) => {
    let w = y.el;
    x(w, A, N(w));
    let g = E(y, T);
    k(y, Vt(() => le(w, A, g)));
  }, r = (y, A) => {
    se(y) && (y = K(y)), se(A) && (A = K(A)), gt(A) || (A = ye), gt(y) && (f(y), ei(y, async (T) => {
      let N = !1, w = y == T ? A : ye;
      return Pf(T) && Tr(T) ? N = n(T, w) : Ke(T) && ($e(T) == b && ae(G(T, H + b)) ? N = !1 : N = await a(T, w)), N;
    }));
  }, c = (y, A = !0, T = !0) => {
    ei(y, (N) => {
      let w = e(N);
      return w && (w[De] && P(w[De], (g) => w[Zt](g, A, T)), w.ph && Nt(w.ph), P(w.cFns, (g) => g()), T && u[Y](N), A && Nt(N)), !0;
    });
  }, n = (y, A) => {
    let T = y[lt], N = Cr($t(T || ""));
    if (N && he(N, yl)) {
      let w = l(y, A), g = E(w, `$el.${lt}=` + mi(N), "", !1);
      k(w, Vt(g)), ai(w, Ae, T);
    }
    return !1;
  }, a = async (y, A) => {
    let T = l(y, A);
    if (!ft(Yt(T))) return !0;
    for (let [N, w] of S) {
      let g = [];
      if ($f(N))
        ur(y, (Oe, Ve) => {
          he(Oe, N) && L(g, [Oe, Ve]);
        });
      else {
        let Oe = G(y, N);
        ae(Oe) || L(g, [N, Oe]);
      }
      for (let [Oe, Ve] of g) {
        if (Yt(T)) break;
        ai(T, Oe, Ve), await w(T, Oe, $t(Ve));
      }
      if (Yt(T)) break;
    }
    return ft(Yt(T)) && (T[qe] = !1), !qt(T[pe]) && !A && u[Y](y), !Yt(T);
  }, f = (y) => {
    if (Ke(y)) {
      let A = xt(ie + `,[${zt}]`, y);
      (G(y, zt) || $e(y) == ie) && L(A, y), P(A, (T) => {
        let N = G(T, zt);
        fl(T, zt);
        let w = $e(T);
        if (w == ie && P(Je(T[pi]), (g) => f(g)), N) {
          let g = w == b, Oe = g ? b : w == j ? j : ie, Ve = T[w == ie ? be : fe];
          Ut[Oe][N] = g ? Pl(pt, $t(Ve), !1) : Ve, ae(G(T, H + st)) && Nt(T);
        }
      });
    }
  }, s = (y) => (A, T) => {
    Ut[y][A] = T;
  }, o = (y, A, T = "", N = !0) => {
    let w;
    return A = kl(A, T, N), A in M ? w = M[A] : (w = rl(), I[w] = Pl(pt, Ar(y, A)), M[A] = w), w;
  }, E = (y, A, T = "", N = !0) => {
    let w;
    try {
      let g = A in I ? A : o(y, A, T, N);
      w = I[g](y.ctx);
    } catch (g) {
      z(g[Hs]), w = () => jt;
    }
    return w;
  }, u = Se(), O = Se(), S = [], h = {}, p = {}, C = { [oe]: Af }, I = {}, M = {}, U = {
    // The element itself
    $el: (y) => y.el,
    // Unique identifier for the element
    $uid: (y) => y.uid,
    // Reactive properties defined in the element or inherited from the parent context
    [ql]: us(ql, H + Ie, !0),
    // The $data context
    [Wl]: us(Wl, ze),
    // Data Level Context:
    // Referenced under the same $data context, not including nested $data contexts
    $refs: Ts("$refs"),
    $slots: Ts("$slots"),
    // The $each context
    [Jt]: (y, A) => A == null ? void 0 : A.ctx[Jt],
    $cleanup: (y) => (A) => k(y, A)
  }, [x, le] = la(O), R = Wf(r, c, h), [F, _] = qf(p, C, R);
  ki[tt] || ps(_);
  let $ = {
    hook: x,
    [tt]: F,
    router: ps,
    [Ji]: s(Ji + "s"),
    [ie]: s(ie),
    [j]: s(j),
    [b]: s(b),
    [Ie]: s(Ie),
    data: s(Lt),
    mask: s(Vl),
    [Js]: s(Ql)
  }, m = {
    [st]: r,
    [Zt]: c,
    [ll]: R,
    [tt]: _,
    emit: it,
    listen: Ne,
    query: K,
    queryAll: xt,
    /** Get the closest parent element of a target element that has a directive (b-data by default) */
    [Ui](y, A = ze) {
      let T = t(K(y), (N) => A in N[pe]);
      return T || z(Ui + ":", Ye, Ol), T == null ? void 0 : T.el;
    },
    /** Get the local context of an element */
    context: (y) => {
      var A;
      return (A = e(K(y))) == null ? void 0 : A.ctx;
    }
  }, Z = {
    $dom: m,
    $http: $l,
    $set: $,
    [ws]: Re({}),
    $state: Re,
    $watch: Qt,
    $effect: Vt,
    [Is]: {
      hasProp: te,
      getProp: Ee,
      setProp: J,
      sync: Xt,
      clone: ve
    },
    $validate: ra
  }, pt, vi = () => pt = `{${re(ue(Z))},${re(ue(U))}}`;
  vi();
  let Ut = {
    [ie]: h,
    [j]: {},
    [b]: {},
    [Ie]: {},
    data: {},
    // ! HYDRATION
    lcFns: U,
    [Qs]: S,
    bnodes: u,
    hooks: O,
    [Vl]: {},
    [Ql]: {},
    routes: p,
    routeRules: C,
    // ! PUBLIC CONTEXT
    gc: Z,
    // ! TOOLS
    exec: E,
    [Gr]: o,
    [hi]: vi,
    [ct]: i,
    bnode: [l, e],
    hook: [x, le]
    // insert,
    // route: [SetRoute, Route],
  };
  return P([$, m, $l, Z, Ut], (y) => Di(y, "wc")), Ut;
}, Yt = (e) => e.skip, k = (e, t) => {
  L(e.cFns, t);
}, kt = (e, t) => {
  let l = e[Dt];
  l && (l[De] || (l[De] = []), v(l[De], t) || L(l[De], t));
}, fa = (e, t, l = "{}") => {
  let i = Ke(e.el) ? G(e.el, t) : null;
  return ae(i) || ai(e, t, i), i = $t(i || l), e.exec(e, i);
}, ai = (e, t, l) => {
  e[pe][t] = l, Ke(e.el) && fl(e.el, t);
}, $t = (e) => ee(W(re(Q(q(e, He), (t) => Be(W(t), "//") ? "" : t), He)), /;$/, ""), yl = /\${((?!.*\${).*?)}/, aa = /{{((?!.*{{).*?)}}/, Cr = (e, t = "${$1}") => Jl(e, aa, t), us = (e, t, l) => (i, r) => {
  let c = i.el, n = r ? r.ctx[e] : rt, a = Ke(c), f = a && !ae(G(c, t)), s = a && (i[pe][de] || !ae(G(c, de))), o = a && (!n || f);
  return o && !f && t == ze && gi(c, ze, ""), o && !s ? Re({}, { [Dt]: l && n }) : n || {};
}, Ts = (e) => (t, l) => !l || Ke(t.el) && !ae(G(t.el, ze)) ? {} : l.ctx[e], ps = (e) => {
  sl(e) && (ki[tt] = () => e(pl()));
}, rn = (e = {}) => {
  ol in Le || (Di(e, "wc"), J(Le, ol, e, "wc"), Ne(Le, _i, bf), Ne(Le, "pop" + me, ki[tt]), it(Le, ol));
}, Ll = (e, t) => Te(e, Be(e, H) ? t : t - 2), na = async (e, t) => {
  e[qe] = !0;
}, ca = [$s, na], oa = (e, t, l) => {
  let i = e.el, [r, c] = e.bnode, [n, a] = e.hook;
  e[qe] = !0;
  let [f, s] = Q(q(l, " in "), W), [o, E] = Q(q(f, ","), W);
  E || (E = Ot);
  let u = we("the", t, nt, Oi);
  if (!he(o, ti) || !he(E, ti))
    return z(u, "a valid alias.");
  let O = e.exec(e, s), S = _r(O), h = S ? S() : O(), p = S && el(h), C = !1;
  if (Il(h) && (h = Re(Zi(h, 1)), C = !0, S && Vt(() => {
    let R = S();
    Il(R) && Xt(h, Zi(R, 1));
  }, () => S())), !(B(h) || Pe(h)))
    return z(u, `an ${Ct}, ${il}, or ${oe}.`);
  e.ph = yr(t), at(i, Ni, e.ph), kt(e, i);
  let I = {}, M = t + "-" + et, U = t + "-" + jl, x = t + "-" + Y;
  n(i, M, ([R, F]) => {
    let _ = bl(i);
    at(e.ph, Ze, _);
    let $ = r(_, i);
    te(e[pe], de) && ($[pe][de] = "");
    let m = Re({});
    J(m, o, F, "c"), J(m, E, R, "c"), J($.ctx, Jt, m, "c"), k($, () => {
      fi(m);
    }), k($, Qt(m, E, ({ [wt]: Z }) => {
      let pt = I[R][1];
      Z !== pt && (m[E] = pt);
    })), p && k($, Qt(m, o, () => {
      h[m[E]] = m[o];
    })), I[R] = [_, R], e[st](_, i);
  }), n(i, U, ([R, F]) => {
    let _ = I[R], $ = c(_ && _[0]);
    if ($) {
      let m = $.ctx[Jt];
      m[o] = F, m[E] = R, _[1] = R;
    }
  }), n(i, x, ([R, F]) => {
    let [_] = I[R];
    e[Zt](_), Xe(I, R);
  });
  let le = {
    [et]: (R) => a(i, M, R),
    [jl]: (R) => a(i, U, R),
    [Y]: (R) => a(i, x, R)
  };
  for (let R of Tt(h))
    le[et](R);
  S && k(e, Qt(h, ye, ({ [Ri]: R, prop: F, [wt]: _ }) => {
    le[R]([F, _]);
  })), k(e, () => {
    for (let R in I)
      le[Y]([Number(R), null]);
    C && fi(h);
  });
}, Ea = [Yr, oa], ua = async (e, t, l) => {
  let i = G(l, t);
  if (i) {
    let r = e.ctx.$refs;
    r[i] = l, fl(l, t), k(e, () => Xe(r, i));
  }
}, Ta = async (e, t, l) => {
  let i = G(l, t);
  if (i) {
    let r = e.ctx.$slots;
    fl(l, t), r[i] = l[be], Nt(l), k(e, () => Xe(r, i));
  }
}, mr = async (e, t, l) => {
  let [i, r] = e.hook, c = t == ze, n = c ? Lt : Ie, a = e[n], f = l ? a[l] || Pl(e[hi](), l) : () => ({}), s = e.ctx[Pt + n];
  i(e.el, t, async () => {
    let o = await f(e.ctx);
    if (!Pe(o))
      return e[qe] = !0, z(lr(nt, t, "an " + il, dt(o)));
    for (let E in o) J(s, E, o[E], xf(o, E));
    c && await Li(e), k(e, () => {
      xe(() => {
        fi(e.ctx[Pt + n]);
      });
    });
  }), await r(e.el, t, s);
}, pa = [H + Ie, mr], ya = [ze, mr], Yl = (e, t) => `:not([${t}]):not([${t}] [${e}])`, ha = (e) => {
  let t = Yl(e, ze) + Yl(e, zt) + Yl(e, $s);
  return `[${e}]${t},${ie + t}`;
}, Dr = (e, t) => {
  let l = [];
  return P(xt(e, t), (i) => {
    $e(i) == ie ? P(Dr(e, i[pi]), (r) => L(l, r)) : L(l, i);
  }), l;
}, ys = async (e, t, l) => {
  let [i, r] = e.hook, c = e.el;
  i(c, t, () => {
    let n = [];
    P(e[De] || [c], (a) => {
      if (Ke(a)) {
        let f = Dr(ha(t), a);
        L(n, a, ...f);
      }
    }), P(n, (a) => l(e, t, a));
  }), await r(c, t);
}, Li = async (e) => {
  await ys(e, "b-ref", ua), await ys(e, "b-slot", Ta);
}, hs = {}, Sa = async (e, t, l) => {
  if (l) {
    let i = e.el, [r, c] = e.hook;
    r(i, t, () => {
      let n = e.exec(e, l)();
      if (!B(n) || !rr(n, se))
        return z("the", t, nt, ke, `an ${Ct} of ${Qe}(s).`);
      e.uid = n.reduce((a, f) => {
        let s = rl(5);
        return hs[s] = !0, J(a, f, s, "wc"), a;
      }, {}), k(e, () => {
        for (let a in e.uid) Xe(hs, e.uid[a]);
      });
    }), await c(i, t);
  }
}, Ra = ["b-uid", Sa], dr = (e) => (t, l, i) => {
  if (!t[pe][Vs] && !t[pe][Xs]) {
    let r = t[ie];
    i in r && (i = mi(r[i] || i)), i && t[ct](t, l, i, (c) => async (n) => {
      await t[ll](n(), e, c), e == Dl && await Li(t);
    });
  }
}, Aa = [Xs, dr(Dl)], Oa = [zr, dr(Ae)], _a = async (e, t, l) => {
  let i = e.el, r = l ? e[ie][l] || e.exec(e, l)() : i[fe];
  l || (i[fe] = "");
  let [c, n] = e.hook;
  c(i, t, async () => {
    se(r) ? (await e[ll](W(r), Ze, i, {
      then: (a) => {
        e[De] = a;
      }
    }), kt(e, i), Nt(i), await Li(e)) : gl(t + ":", Al, D, `
`, r);
  }), await n(i, t);
}, wa = [Vs, _a], Ia = async (e, t, l) => {
  let i = e.el, r = e[b], c = $e(i) == b;
  e[qe] = c;
  let [n, a] = e.hook, f = l ? r[l] || e.exec(e, l)() : [];
  f = Q(
    B(f) ? f : [f],
    (s) => r[s] || s
  ), kt(e, i), n(i, t, async () => {
    if (c) {
      let s = G(i, "src");
      s && Pr.add(s);
      let o = s ? await $l.get(s) : Tr(i);
      o && L(f, $t(o)), Nt(i);
    }
    for (let s of f) {
      let o = s;
      if (se(o)) {
        let E = ar(o);
        o = Pl(e[hi](), Ar(e, o), E), E && (o = o(e.ctx));
      }
      sl(o) && await o(e.ctx);
    }
  }), await a(i, t);
}, Na = [H + b, Ia], $a = (e, t, l) => {
  let i = e.el;
  if (l && $e(i) != j) {
    let [r, c] = e.hook, n = e[j], a = n[l] || e.exec(e, l)();
    a = Q(
      B(a) ? a : [a],
      (s) => n[s] || s
    );
    let f = rl();
    r(i, t, () => {
      vf(i, f);
      let s = pr(j);
      s[lt] = Pa(re(a, He), "." + f), e[st](s, i), at(i, Me, s), k(e, () => {
        e[Zt](s);
      });
    }), c(i, t, f);
  }
}, Pa = (e, t) => {
  e = ee(e, /\/\*[\s\S]*?\*\//g, ""), e = Cr(e);
  let l = [], i = rl();
  for (; he(e, yl); ) {
    let f = Pi(e, yl);
    f && (L(l, f[0]), e = ee(e, yl, i));
  }
  let r = It(q(e, "}"), W), c = He + "    ", a = re(Q(r, (f) => {
    let [s, o] = q(f, "{"), E = Q(
      Q(q(s, ","), W),
      (u) => v(u, "&") ? ee(u, /&/g, t) : t + " " + u
    );
    return o = re(Q(It(q(o || "", He), W), W), c), re(E, ",") + ` {${c + o + He}}`;
  }), He);
  return P(l, (f) => {
    a = ee(a, i, f);
  }), a;
}, Ca = [H + j, $a], ma = (e, t, l) => {
  let i, r;
  try {
    i = K(l), gt(i) && (l = kl(l, "", Ae));
  } catch {
  }
  e[ct](e, t, l, (c) => (n) => {
    try {
      let a = n();
      B(a) ? [i, r] = a : i = K(a);
    } catch {
    }
    v([Ze, Me, Ur, Ns], r) || (r = Me), gt(i) ? (at(i, r, ...e[De] || [c]), kt(e, c)) : gl(Ws, Ye, Ol, t + `="${l}"`);
  });
}, Da = [H + Ws, ma], Mi = rl(), da = (e, t, l) => {
  if (!(te(e[pe], de) ? de : te(e[pe], El) ? El : ""))
    return z("the", t, nt, ke, "used with", de, "or", El + ".");
  let r = e.exec(e, l)();
  if (B(r) || d(r) == 2) {
    let c = xa(e.el, ...r);
    e[ne][Mi] = c, k(e, c[We]);
  }
}, ga = [H + _t, da], xa = (e, t, l) => {
  if (!Ke(e))
    return z(Al, _t, Ye, e);
  let i = null, r = 1, c = 2, n = 3, a = 4, f = r, s = {
    [_t]: ["none", "important"]
  }, o = Rr(e[j]), E, u, O, S, h, p, C = () => {
    if (E = ss(t), S = ss(l), !E || !S)
      return z(Al, _t, V + "ors:", `'${t}' and '${l}'`, ke, "valid CSS", V + "ors.");
    [u, O] = is(E), [h, p] = is(S);
  }, I, M = Ne(e, _t + Wt, (x) => {
    x[Fe] === e && (f == c ? (f = a, i && (_e(e, E), ce(e, o))) : f == n && (f = r, i || (_e(e, S), ce(e, o))), I && I());
  }), U = (x, le) => {
    I = le, !(x && i && f == a || !x && i === !1 && f == a) && (C(), x ? i === null || i && f == r || i === !1 && f == a ? (i = !0, f = c, _e(e, S, u), ce(e, O, s), Ul(() => {
      _e(e, O, s), ce(e, u);
    })) : !i && f == c ? (f = n, _e(e, p), ce(e, h)) : i && f == n && (f = c, _e(e, O), ce(e, u)) : (i === null && (i = !1, f = a, _e(e, E, h), ce(e, p, s), Ul(() => {
      _e(e, s);
    })), !i && f == r || i && f == a ? (i = !1, f = c, _e(e, E), ce(e, s), Ul(() => {
      _e(e, s), ce(e, S);
    })) : i && f == c ? (f = n, ce(e, E)) : !i && f == n && (f = c, ce(e, S))));
  };
  return J(U, We, M), U;
}, ka = (e, t, l) => {
  let i = e.el, r = bl(i);
  e.ph = yr(t), at(i, Ni, e.ph), e[qe] = !0, kt(e, i);
  let [c] = e.bnode, n, a, f = () => {
    e[Zt](n.el), n = ye;
  };
  e[ct](e, t, l, () => (s) => {
    let o = s();
    xe(() => {
      if (o) {
        if (!n) {
          let E = bl(r);
          at(e.ph, Me, E), n = c(E, i), n[pe][de] = "", e[st](E, i), kt(e, E);
        }
        a = n[ne][Mi], a && a(!0);
      } else !o && n && (a ? a(!1, f) : f());
    });
  });
}, La = [de, ka], Ma = (e, t, l) => {
  let i = hr(e.el)[Rl];
  i == "none" && (i = "block"), e[ct](e, t, l, (r) => (c) => {
    let n = c();
    bt(r) && xe(() => {
      let a = e[ne][Mi];
      n ? (r[j][Rl] = i, a && a(!0)) : a ? a(!1, () => Ss(r)) : Ss(r);
    });
  });
}, Ha = [El, Ma], Ss = (e) => {
  e[j][Rl] = "none";
}, al = (e, t, l) => {
  let [i, r] = e.hook, c = Ll(t, 5), [n] = q(c, "-"), a = e[ne][t] || {}, f = e.el, s = e.exec(e, l, "$entry", !1);
  i(f, t, Nl(s, a[Sl] || 100));
  let o = new IntersectionObserver((E) => {
    P(E, async (u) => {
      u.isIntersecting != (n == ks) && (await r(f, t, u), a[Bs] && o[Gl]());
    });
  }, a);
  o[Fs](f), k(e, () => o[Gl]());
}, va = [
  [Gi, al],
  [H + Gi, al],
  [Ki, al],
  [H + Ki, al]
], Rs = (e, t, l) => {
  let [i, r] = e.hook, c = Ll(t, 5);
  q(c, "-");
  let n = e.el, a = e[ne][t] || {}, f = a[yi] ? K(mt) : n, s = e.exec(e, l, "$size", !1);
  i(n, t, Nl(s, a[Sl] || 100));
  let o = new ResizeObserver((E) => {
    let u = E[0].borderBoxSize[0];
    r(n, t, [u.inlineSize, u.blockSize]);
  });
  o[Fs](f, a), k(e, () => o[Gl]());
}, Ua = [
  [ji, Rs],
  [H + ji, Rs]
], ht = "keyup", St = "keydown", As = "outside", Fa = "window", gr = "control", ni = "meta", nl = "arrow", Os = [
  ni,
  gr,
  "shift",
  "alt",
  "fn"
], Ba = {
  ctrl: gr,
  cmd: ni,
  super: ni,
  esc: "escape",
  del: Y,
  up: nl + "up",
  down: nl + "down",
  left: nl + "left",
  right: nl + "right"
}, Ya = (e, t, l) => {
  let [i, r] = e.hook, c = Ll(t, 5), [n, ...a] = q(c, "-"), f = e.el, s = f, o = (p) => {
    let C = e.exec(e, l, Pt + Yi, !1);
    sl(C) ? C(p) : z(lr(Yi, t, "a " + dl, dt(C())));
  }, E = e[ne][t] || {};
  P(a, (p) => {
    E[p] = !0;
  }), Sl in E && (o = Nl(o, E[Sl])), Xi in E && (o = Mf(o, E[Xi])), i(f, t, o), E[As] || E[yi] ? s = vt : E[Fa] && (s = Le);
  let u = {};
  v([St, ht], n) && P(Ee(E, "keys", []), (p) => {
    u[Ba[p] || p] = !0;
  });
  let O = qt(u), S = n;
  if (v([St, ht], n) && O) {
    let p = {};
    n = t;
    let C = Nl((I) => {
      it(s, n, I);
    }, 600);
    k(e, Ne(s, St, (I) => {
      let M = ge(I.key);
      p[M] || (p[M] = !0), xe(() => {
        p.meta && !v(Os, M) && zl(I, p);
      });
      let U = ue(p);
      O > 1 && ht == S && p.meta && !v(Os, M) ? C(U) : St == S && it(s, n, U);
    })), k(e, Ne(s, ht, (I) => {
      St == S && zl(I, p), it(s, n, ue(p)), ht == S && zl(I, p);
    })), k(e, Ne(s, "focus", () => {
      di(p);
    }));
  }
  k(e, Ne(s, n, (p) => {
    if (E[Ys] && p[sf](), E.stop && p.stopPropagation(), !(E.self && p[Fe] !== p.currentTarget) && !(E[As] && (f.contains(p[Fe]) || !Yf(f)))) {
      if (v([St, ht], S)) {
        let C = p[Ds];
        if (!(qt(u) == qt(C) && rr(ue(u), (I) => v(C, I))))
          return;
      }
      r(f, t, p);
    }
  }, E));
}, zl = (e, t) => Xe(t, ge(e.key)), za = [/^(b-on-|on-)[\w-]+$/, Ya], Ga = (e, t, l) => {
  let i = Ll(t, 7);
  l = kl(l || _f(i), "$initial"), i = Gf(i);
  let r = G(e.el, i), c = e[ne][t] || {};
  e[ct](e, t, l, (n) => (a) => {
    let f = a(r || ""), s = c.prop || Sr(i) && i;
    f || s ? gi(n, i, !s && f === !0 ? "" : f, s) : fl(n, i);
  });
}, Ka = [/^(b-bind-|bind-)[\w-$]+$/, Ga], cl = Se(), ja = (e, t, l) => {
  let [i, r] = e.hook, c = we("the", t, nt), n = we(Oi, "a reactive", D), a = V + "ed", f = e.el, s = $e(f), o = f.type;
  if (!v([X, At, V], s))
    return z(c, Ps, X, `, ${At}, and ${V} ${Ye}s.`, f);
  let E = _r(e.exec(e, l));
  if (!E) {
    z(c, n, f);
    return;
  }
  let u = E(), O, S = () => Ge(s == V ? f[ne] : M()), h = e[ne][t] || {}, p = (_) => {
    let $ = _[ae(G(_, D)) && I ? Rt : D], m = cl.get(_) || h;
    if (se($) && (m.trim && ($ = W($)), !m.raw)) {
      let Z = Ci($);
      (Il(Z) || ae(Z) || Nf(Z)) && ($ = Z);
    }
    return $;
  }, C = (_) => s == X && v(_, o), I = C([yt, qi]), M = () => xt(X + `[type="${yt}"][name="${f.name}"]`), U = () => C(yt) && d(M()) > 1, x = () => {
    let _ = [
      [X, yt, [oe, Qe, ul, Ct]],
      [X, qi, [oe, Qe, ul]],
      [X, oe, [oe]],
      [X, "range", [oe]],
      [X, "", [oe, Qe]],
      [At, "", [oe, Qe]],
      [V, "", [oe, Qe, ul, Ct]]
    ];
    for (let [$, m, Z] of _)
      if (s == $ && (!m || o == m)) {
        ae(u) || ft(u) || v(Z, dt(u)) || gl(c, n, Zs, re(Z, " or "), `for ${s == X ? o + " " : ""}${$} ${Ye}s,`, ir(dt(u)), f);
        break;
      }
  };
  xe(() => {
    x(), V == s ? P(S(), (_) => cl.set(_, h)) : C(yt) && cl.set(f, h);
  }, 1);
  let le = () => {
    if (u = E(), O = p(f), v([X, At], s))
      if (o == yt && B(u))
        f[Rt] = v(u, O);
      else if (I)
        f[Rt] = u === O;
      else {
        if (f[wl] || vt.activeElement === f && u === O) return;
        u !== O && (f[D] = u);
      }
    else s == V && (B(u) ? P(S(), (_) => {
      _[a] = v(u, p(_));
    }) : f[D] = u);
  };
  xe(() => k(e, Vt(le)), 5);
  let R = {};
  i(f, t, (_) => {
    if (u = E(), s == V && f.multiple || U()) {
      let $ = [];
      P(S(), (m) => {
        s == V && cl.set(m, h), (m[a] || m[Rt]) && L($, p(m));
      }), E($);
    } else E(I && !f[Rt] ? !1 : p(f));
  }), (C([Ae, "search", "url", "tel", "email", "password"]) || s == At) && (R[Wr] = Ff, R[qr] = Bf);
  let F = h.lazy || I || s == V ? "change" : X;
  R[F] = () => r(f, t, E);
  for (let [_, $] of Tt(R))
    k(e, Ne(f, _, $));
}, Wa = ["b-model", ja], qa = (e) => {
  e["#"] = new RegExp("\\p{Nd}", "u"), e["&"] = /[\p{L}]/u, e["*"] = /[\p{L}\p{Nd}]/u;
}, hl = "output", Ue = "cursor", Hi = "character", ci = "quantifier", Cl = "isToken", ml = "isOptional", oi = "isMultiple", Ei = "parts", Xa = (e, t, l) => {
  let i = e.el, r = e[Vl], [c, n] = e.hook;
  if (!(D in i && vl in i))
    return z("the", t, nt, Ps, At, Ye + "s and textual", X, "types (text, email, etc.).");
  let a = r[l], f = e[ne][t] || {}, s = {
    ...f,
    [_l]: { ...e[Ql], ...f[_l] },
    mask: l,
    [D]: "",
    [Ue]: i[vl],
    [Ei]: [],
    [hl]: ""
  };
  c(i, t, () => {
    s[D] = i[D], s[D] != s[hl] && (s[Ei] = [], s[Ue] = i[vl], a && a(s), Ja(s), i[D] = s[hl], i.setSelectionRange(s[Ue], s[Ue]), it(i, Mt, s));
  }), xe(() => n(i, t), 7);
  let o = Ne(i, X, () => n(i, t), !0);
  k(e, o);
}, Va = (e, t) => {
  let l = [], i = "\\";
  for (let r = 0; r < d(e); r++) {
    let c = e[r], n = {
      [Hi]: c,
      [ci]: 1,
      [Cl]: !1,
      [ml]: !1,
      [oi]: !1
    };
    if (c != i || c == i && e[r + 1] == i) {
      if (v(ue(t), c) && (e[r - 1] != i || e[r - 2] == i)) {
        let a = Pi(Te(e, r + 1), /^\d+/);
        if (a) {
          let s = a[0];
          r += d(s), n[ci] = +s;
        }
        n[Cl] = !0;
        let f = e[r + 1];
        (f == "?" || f == "+") && (n[ml] = f == "?", n[oi] = f == "+", r++);
      }
      L(l, n);
    }
  }
  return l;
}, Qa = (e, t) => sr(Te(e, t + 1), (l) => !l[ml]), _s = (e, t, l) => {
  let i = -1;
  if (t) {
    let r = t[Hi];
    if (t[Cl]) {
      let c = Pi(e, l[r]);
      c && (i = c[Ot]);
    } else i = yf(e, r);
  }
  return i;
}, Ja = (e) => {
  let t = e[_l], l = e[D], i = e[Ue], r = Va(e[Mt], t), c = "", n = l, a = Te(l, i);
  for (let [f, s] of Tt(r)) {
    let o = s[Hi], E = s[ci];
    if (s[Cl]) {
      if (E > 0) {
        if (!n) break;
        let u = "";
        for (; n && (E > 0 || s[oi]); ) {
          let O = s[ml] || E < 1, S = _s(n, s, t), h = O && S > 0 && Qa(r, +f), p = _s(n, h, t);
          if (S < 0 || p >= 0 && S > p) {
            O || (n = "");
            break;
          }
          S || (u += n[0], E--), n = Te(n, 1), a == n && (i = d(c + u));
        }
        c += u, s[D] = u;
      }
    } else n && (a == n && (i = d(c)), c += o, s[D] = o, n[0] == o && (n = Te(n, 1)));
  }
  e[Ue] = e[Ue] == 0 ? 0 : e[Ue] == d(e[D]) ? d(c) : i, e[hl] = c, e[Ei] = r;
}, Za = (e) => {
  let t = e[D], l = Ee(e, "decimal", "."), i = Ee(e, "thousands", ","), r = Ee(e, "precision", 2);
  l == "," && (i = "."), i == "." && (l = ",");
  let c = q(t, l), n = c[0], a = Be(n, "-");
  n = ee(n, /\D/g, ""), n = n && (ee(n, /^0+/, "") || "0");
  let f = d(c) > 1, s = f ? re(Te(c, 1), l) : "", o = d(n), E = a ? "-" : "";
  for (let h = 0; h < o; h++)
    h > 0 && (o - h) % 3 == 0 && (E += i), E += "#";
  let u = e[_l];
  t = a ? "-" + n : n, r > 0 && (u[l] = or(`\\${l}`), f && (t += l + s), E += l + "#" + r), e[Mt] = E, a && (u["-"] = /-/), u["#"] = /\d/;
  let O = 0, S = "";
  for (let h of e[D])
    h == t[O] ? (S += h, O++) : S += "∅";
  e[D] = S;
}, ba = [H + Mt, Xa], en = (e, t, l) => {
  l = kl(l, "$controls", !1), e[ct](e, t, l, () => async (i, r) => {
    await i(r);
  });
}, tn = ["b-effect", en], ln = [
  /**
   * The b-ignore directive is used to stop the hydration of the element and its children.
   */
  ca,
  /**
   * Conditional hydration
   * Notes:
   * - b-if stops the hydration flow of the element and starts a new hydration flow with a copy of the element whenever the condition evaluates to true
   * - the original element is replaced with a placeholder comment node to hold its location in the DOM
   * - whenever the condition evaluates to false, the copy of the element is dehydrated and removed from the DOM
   */
  La,
  /**
   * Context directives
   * Notes:
   * - the order of inference is: $each, $uid, $data, $props, $store, $tools
   */
  pa,
  ya,
  /** List rendering
   * Notes:
   * - b-each stops the hydration flow of the element and starts a new hydration flow for each item it creates
   */
  Ea,
  /**
   * Unique ID generator
   */
  Ra,
  /**
   * Static template hydration
   * Notes:
   * - the inner HTML of the element is used as a template and it may include more than one root element
   * - the element that contains the b-template directive is removed from the DOM and its content is inserted in its place
   *   and because of that:
   *   - the b-template directive SHOULD NOT be used with elements that are self-closing (e.g. <img />, <input />, etc.)
   *   - the b-template directive CANNOT be used with: b-show, b-html, b-text, b-style, bind-*, b-model, b-mask, b-transition, on-*
   *     this is because these directives need to be hydrated on the element itself and not on its content
   *   - the b-template directive CAN be used with: b-ignore, b-props, b-data, b-ref, b-slot, b-if, b-each, b-uid, b-teleport, b-script, b-effect
   */
  wa,
  /**
   * Conditional display
   * Notes:
   * - the element is hydrated regardless of the condition
   * - the b-show directive toggles the `display` of the element based on the condition
   */
  Ha,
  /**
   * The b-teleport moves the element to a different location in the DOM.
   * Notes:
   * - b-teleport also works with the b-if and b-template directives
   */
  Da,
  /**
   * Run one or more scripts on the element
   * Notes:
   * - the b-script directive may hold one script or an array of scripts
   * - the script(s) are executed in order and awaited
   * - when b-script is in a script element the content of the src file or text content is added to the list of scripts to be executed
   */
  Na,
  /**
   * Dynamic hydration of HTML or text content and styles
   * Notes:
   * - if the element has a b-html and b-text directive, the b-html directive is hydrated and the b-text directive is ignored
   * - b-style always hydrates regardless of the b-html and b-text directives
   */
  Aa,
  Oa,
  /**
   * Dynamic insertion of styles
   * Notes:
   * - the style element is inserted after the element that contains the b-style directive
   */
  Ca,
  /**
   * Data binding directives
   * Used to bind data to an element's property or attribute
   * 
   * - The `b-bind-|bind-` directive is a general directive used to bind data to an element property or attribute
   * - The `b-model` directive is used to create a two-way data binding between an input value and a reactive property
   * - The `b-mask` directive is used to format an input value using a mask
   */
  Ka,
  // [b-bind|bind]-[attributeName]
  Wa,
  ba,
  // ['b-boost', hydrateBoost],
  ga,
  // b-transition, b-transition-play, b-transition-reverse
  ...va,
  // [b-on|on]-enter, [b-on|on]-exit
  ...Ua,
  // [b-on|on]-resize
  za,
  // [b-on|on]-[eventName]
  /**
   * b-effect: used to create an effect that run when its dependencies change.
   * It is perfect for small expressions, reactive or not.
   * Example: console.log(`Hello, ${$data.name}!`)
   */
  tn
], fn = (e) => {
  P(ln, (t) => L(e[Qs], t)), e.masks.money = Za, qa(e.maskTokens);
};
export {
  Ka as bindDirective,
  ya as dataDirective,
  Ea as eachDirective,
  Aa as htmlDirective,
  La as ifDirective,
  ca as ignoreDirective,
  va as intersectionDirectives,
  ba as maskDirective,
  Wa as modelDirective,
  Za as moneyMask,
  sn as newApp,
  za as onDirective,
  pa as propsDirective,
  Ua as resizeDirectives,
  Na as scriptDirective,
  fn as setAllDirectives,
  qa as setDefaultMaskTokens,
  ki as settings,
  rn as setup,
  Ha as showDirective,
  Ca as styleDirective,
  Da as teleportDirective,
  wa as templateDirective,
  ga as transitionDirective,
  Ra as uidDirective
};
//# sourceMappingURL=briojs.1.0.1.js.map
