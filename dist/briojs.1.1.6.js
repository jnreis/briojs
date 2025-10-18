let il = "brio", At = "$", Hl = "$refs", Yl = "$slots", ps = "$store", Rs = "$tools", Be = "after", ys = "append", _t = "array", Pe = "attr", ni = "Attribute", Ss = "a valid", U = "b-", Ie = "b-if", vr = "b-ignore", ci = "b-ref", Ur = "b-save", sl = "b-show", Xe = "before", Ll = "begin", Fr = "body", rl = "boolean", hs = "can only be used on", Os = "Cannot ", Tt = "checkbox", Rt = "checked", Ns = "class", As = "clone", Ei = "composi", _s = "content", ms = "Content", mt = "create", dt = "data", ul = "debounce", Is = "detail", ws = "define", k = "delete", it = "directive", zl = "disconnect", Tl = "display", ui = "document", Ps = "each", be = "element", al = "email", Ft = "end", xi = "entries", gi = "error", st = "evalEffect", Li = "event", Cs = "EventListener", ds = "exit", Ds = "ctxArgs", rt = "get", $s = "head", Mi = "href", It = "html", xs = "HTML", Ce = "hydrate", We = "index", Il = "inner", Qt = "insert", ol = "Invalid", Gl = "length", Dt = "mask", gs = "message", Br = "method", Ue = "must be", Te = `
`, Ot = "newValue", Ls = "name", Ms = "Node", Ae = "nodes", Kl = "not found.", et = null, ce = "number", Jt = "object", vs = "observe", Mt = "oldValue", Ti = "on-", vi = Ti + "enter", Ui = Ti + ds, Fi = Ti + "resize", Us = "once", oi = "operation", fe = "options", pi = "outer", Ge = "parent", Bi = "patch", kr = "post", Hr = "prepend", Fs = "prevent", Bs = "Propert", at = Bs + "y", _e = "props", ks = "put", ki = "radio", ft = "remove", Hs = "replace", Ri = "requires", Qe = "route", ee = "script", se = "skip", W = "select", ue = "state", Ys = "start", yi = "storage", qe = "string", z = "style", zs = "super", Gs = "teleport", $e = "template", re = "text", Hi = "throttle", Si = "tion", Yr = "toString", pl = "tokens", ht = "transition", Ks = "type", pe, js = "update", Ws = "validate", P = "value", hi = "With", zr = "add" + Cs, jl = At + dt, zt = At + Ps, Wl = At + _e, Ke = U + dt, qs = U + Ps, Xs = U + It, Oi = U + $e, Gr = U + re, Kr = Ns + "List", jr = As + Ms, Rl = Ei + "ng", Wr = Ei + Si + Ys, qr = Ei + Si + Ft, Xr = mt + "Comment", Vr = mt + "Element", ql = ws + at, Qr = ws + Bs + "ies", Gt = "de" + Ce, Yi = k + at, Vs = it + "s", Jr = "ends" + hi, wl = "func" + Si, Zr = rt + ni, br = rt + at + "Value", ea = rt + at + "Priority", zi = $s + "ers", Ee = Il + xs, j = "in" + ks, ta = Qt + "AdjacentHTML", yl = Dt + "s", Qs = Dt + "Token", Sl = Qs + "s", Js = "of " + Ks, Ve = pi + xs, Zs = "Own" + at, la = Ge + Ms, Ml = "path" + Ls, ia = Fs + "Default", bs = "proto" + Ks, sa = ft + ni, ra = ft + Cs, aa = ft + at, Ni = Hs + hi, Gi = Qe + "Rule", vl = W + "ionStart", fa = "set" + ni, na = "set" + at, ca = Ys + "s" + hi, Ea = yi + "Area", Ye = "tar" + rt, yt = re + "area", Je = re + ms, ua = "async" + wl, er = rt + Zs + "Descriptor", Ta = er + "s", oa = "has" + Zs, tr = (e, t, l, i) => `the ${e} ${t} ${Ri} ${l}, ` + lr(i), lr = (e) => `but got ${e} instead.`, v = (e, ...t) => e.push(...t), ir = (e, t) => e.sort(t), le = (e, t) => e.join(t), C = (e, t) => e.forEach(t), X = (e, t, l) => e.map(t, l), Nt = (e, t, l) => e.filter(t, l), sr = (e, t, l) => e.find(t, l), rr = (e, t, l) => e.every(t, l), ar = (e, t, l) => e.some(t, l), pa = (e, t, l) => e.indexOf(t, l), Ra = (e, t) => t[1] - e[1], tt = (e) => Array.from(e), Ki = (e, t = 0) => X(tt({ [Gl]: e }), (l, i) => t + i), B = (e) => e.trim(), xe = (e) => e.toLowerCase(), G = (e, t, l) => e.split(t, l), Pl = (e, t) => e.match(t), ya = (e) => e.toUpperCase(), Sa = (e) => ya(e[0]) + ie(e, 1), ha = (e) => xe(e[0]) + ie(e, 1), ze = (e, t, l) => e[ca](t, l), ji = (e, t, l) => e[Jr](t, l), Re = (e, t) => t.test(e), Z = (e, t, l) => e[Hs](t, l), Xl = (e, t, l) => {
  for (; Re(e, t); )
    e = Z(e, t, l);
  return e;
}, Oa = (e) => Re(e, /^\d+$/), Na = (e) => Re(e, /^(\w|\s|\.|\$|`|'|"|(\[(.|\s)+?\]))*;?$/g) && !ze(e, k + " "), fr = (e) => Re(B(e), /^((async\s+)?function\s*\([^)]*\)\s*{[^}]*}|(async\s*)?(?:\([^()]*\)|[$\w]+)\s*=>)/), Aa = (e) => ha(le(X(G(e, "-"), Sa), "")), nr = (e) => JSON.stringify(e), Ai = (e, t) => {
  try {
    e = JSON.parse(e, t);
  } catch {
  }
  return e;
}, cr = (e) => "`" + Z(e, /`/g, "\\`") + "`", Ne = (...e) => le(e, " "), wt = (e) => xe(ie(De[bs][Yr].call(e), 8, -1)), nt = (e, t) => wt(e) === t, ae = (e) => e === et, Kt = (e) => e === pe, de = (e) => nt(e, Jt), F = (e) => nt(e, _t), Cl = (e) => _a(e) || ma(e), _a = (e) => nt(e, wl), ma = (e) => nt(e, ua), te = (e) => nt(e, qe), hl = (e) => nt(e, ce) && isFinite(e), Ia = (e) => nt(e, rl), wa = (e) => $t(e, Er), $t = (e, t) => e instanceof t, Pt = (e) => $t(e, Node), Pa = (e) => $t(e, Text), ct = (e) => $t(e, HTMLElement), Vl = (e) => $t(e, Map), Ql = (e) => $t(e, Set), Fe = window, De = Object, gt = Reflect, fl = location, xt = Fe[ui], Ca = Symbol, Er = RegExp, K = (e, t) => De[bs][oa].call(e, t), we = (e, t, l) => {
  let i = l;
  try {
    i = t in e ? e[t] : l;
  } catch {
  }
  return i;
}, Et = (e, t) => delete e[t], da = [
  ["w", "writable"],
  ["e", "enumerable"],
  ["c", "configurable"]
], V = (e, t, l = pe, i = {}) => {
  let a = "";
  te(i) && (a = i, i = {}), C(da, ([f, n]) => {
    K(i, f) ? i[n] = i[f] : K(i, n) || (i[n] = !M(a, f));
  }), i[P] = l, De[ql](e, t, i);
}, Bt = (e) => D(oe(e)), oe = (e) => De.keys(e), Da = (e = et) => De[mt](e), $a = (e, t = {}) => {
  const l = Da(e);
  return De[Qr](
    l,
    De[Ta](t)
  ), l;
}, xa = (e, t, l = De) => l[er](e, t), ga = (e) => De.getPrototypeOf(e), _i = (e, t = {}) => {
  C(oe(e), (l) => {
    V(e, l, e[l], t);
  });
}, mi = (e) => C(oe(e), (t) => {
  Et(e, t);
}), Me = (e = pe) => new Map(e), je = (e = pe) => new Set(e), ur = (e, t) => new Er(e, t), kt = (e, t) => {
  if (e === t) return e;
  if (F(e) && F(t)) {
    for (; D(e) > D(t); ) e.pop();
    for (let l = 0; l < D(t); l++)
      l < D(e) ? e[l] = kt(e[l], t[l]) : e.push(ke(t[l]));
  } else if (Vl(e) && Vl(t)) {
    let l = Me(e);
    e.clear();
    for (let [i, a] of ut(t))
      e.set(i, l.has(i) ? kt(l.get(i), a) : ke(a));
  } else if (Ql(e) && Ql(t)) {
    e.clear();
    for (let l of t)
      e.add(l);
  } else if (de(e) && de(t)) {
    let l = { ...e };
    mi(e);
    for (let i in t)
      K(t, i) && (e[i] = K(l, i) ? kt(l[i], t[i]) : ke(t[i]));
  } else
    return t;
  return e;
}, ke = (e) => {
  let t = e;
  if (de(e)) {
    let l = {};
    for (let i in e)
      K(e, i) && (l[i] = ke(e[i]));
    t = l;
  }
  return F(e) && (t = X(e, ke)), Vl(e) && (t = Me(X(tt(ut(e)), ([l, i]) => [l, ke(i)]))), Ql(e) && (t = je(X(tt(e), ke))), t;
}, M = (e, t, l) => e.includes(t, l), ut = (e) => de(e) ? De[xi](e) : e[xi](), ie = (e, t, l) => e.slice(t, l), D = (e) => Kt(e[Gl]) ? e.size : e[Gl], Le = (e, t = 0) => setTimeout(e, t), La = (e) => {
  clearTimeout(e);
}, Ol = (e, t) => {
  let l;
  return (...i) => {
    La(l), l = Le(() => e(...i), t);
  };
}, Ma = (e, t) => {
  let l = 0;
  return (...i) => {
    let a = Date.now();
    if (!(a - l < t))
      return l = a, e(...i);
  };
}, Wi = {}, qi = (e) => ie(Z(crypto.randomUUID(), /-/g, ""), 0, e - 1), Zt = (e = 8) => {
  let t = qi(e);
  for (; t in Wi; ) t = qi(D(t) + 1);
  return Wi[t] = !0, "b" + t;
}, Tr = (e, ...t) => console[e]("Brio.js", ...t), dl = (...e) => Tr("warn", "warn:", Te, ...e), H = (...e) => Tr(gi, `detected an ${gi}:`, Te, ...e), Dl = (e, t = xt) => tt(t.querySelectorAll(e)), q = (e, t = xt) => te(e) ? Dl(e, t)[0] : e, lt = (e, t, ...l) => e[t](...l), va = (e, t, l) => {
  t == Ee || t == Ve ? e[t] = l : e[ta](t, l);
}, or = (e) => e[jr](!0), pr = (e, t) => C(tt(e.attributes), ({ name: l, [P]: i }) => t(l, i)), jt = (e) => e[ft](), Wt = (e) => e[la], Rr = (e) => B(e[Je] || ""), St = (e) => [...e.childNodes], b = (e, t) => e[Zr](t), Ii = (e, t, l, i) => {
  i && (e[i] = l), e[fa](t, l);
}, wi = (e, t) => e[sa](t), Ua = (e, ...t) => e[Kr].add(...t), Xi = requestAnimationFrame, Ul = (e) => Xi(() => Xi(e)), yr = (e, t) => xt[Vr](e, t), Sr = (e) => xt[Xr](e), Fa = (e) => new DOMParser().parseFromString(e, re + "/" + It), ge = (e) => xe(e.tagName || ""), me = (e, t, l, i) => (te(e) && (e = q(e)), e[zr](t, l, i), () => e[ra](t, l)), Ze = (e, t, l) => q(e).dispatchEvent(new CustomEvent(xe(Z(t, /[^a-z\d]/gi, "")), {
  bubbles: !0,
  cancelable: !0,
  [Is]: l
})), Nl = async (e, t, l = !1) => {
  if (await t(e))
    for (let i of St(l && ge(e) == $e ? e[_s] : e))
      await Nl(i, t, l);
}, Ba = (e) => e[Ye][Rl] = !0, ka = (e) => {
  let t = e[Ye];
  t[Rl] && (t[Rl] = !1, Ze(t, j));
}, hr = (e) => Fe.getComputedStyle(e), Ha = (e) => {
  let t = hr(e);
  return !(!Wt(e) || t[Tl] == "none" || t.visibility == "hidden" || t.opacity == "0");
}, Ya = (e, t) => new URL(e, t), nl = (e = "", t = Mi) => Ya(e, fl[Mi])[t], Or = (e) => M([P, Rt, W + "ed"], e), za = (e) => Z(Z(e, /[^a-z0-9_-]/gi, ""), /^[^a-z_]+/i, ""), Nr = (e) => {
  let t = {};
  for (let l of e)
    t[l] = [e[br](l), e[ea](l)];
  return t;
}, Vi = (e) => {
  let t = {}, l = {};
  for (let i in e)
    (ze(i, ht) ? t : l)[i] = e[i];
  return [t, l];
}, Qi = (e) => {
  for (let t of document.styleSheets)
    try {
      for (let l of t.cssRules)
        if (l.selectorText == e)
          return Nr(l[z]);
    } catch {
    }
}, Ga = (e, t, l, i) => {
  e[z][na](t, l, i);
}, Ka = (e, t) => {
  e[z][aa](t);
}, ne = (e, ...t) => {
  for (let l of t)
    for (let i in l)
      Ga(e, i, ...l[i]);
}, Oe = (e, ...t) => {
  for (let l of t)
    for (let i in l)
      Ka(e, i);
}, ja = (e, t, l) => async (i, a, f, n) => {
  let r = a == pi ? Ve : a == Il ? Ee : a == re ? Je : a == Xe ? Xe + Ll : a == "first" ? Be + Ll : a == "last" ? Xe + Ft : a == Be ? Be + Ft : a, c = "$dom." + Qt, s = q(f), E = q($s), T = q(Fr);
  if (!s) return H(c, be, Kl);
  (E == s || T == s) && (r = Ee);
  let u = q(It) == s, y = r == Je, o = y || r == Ee, S = r == Ve, h = o ? s : Wt(s);
  if (!h && !u) return H(c, Ge, be, Kl);
  i = await i, i in l && (i = l[i]());
  let $ = Pt(i) ? i : Fa(i), L = we(n, W);
  L && (i = q(L, $)), Pt(i) && (i = i[Ve]), (S || u) && t(s, !1), o && C(St(s), (w) => t(w));
  let Q = je(St(s));
  h && C(St(h), (w) => Q.add(w));
  let J = (w) => Nt(St(w), (d) => !Q.has(d)), N = [];
  if (u ? (s[Ee] = q(It, $)[Ee], N = [s, ...Dl(ee, s)]) : o ? (s[y ? Je : Ee] = i, N = St(s)) : S ? (s[Ve] = i, N = J(h)) : (va(s, r, i), N = J(r == Xe + Ll || r == Be + Ft ? h : s)), ir(N, (w, d) => {
    let _ = ge(w) == z, A = ge(d) == z;
    return _ && !A ? -1 : A && !_ ? 1 : 0;
  }), C(N, (w) => {
    if (
      // is script element
      ge(w) == ee && // is not b-script
      ae(b(w, U + ee)) && // should load: !(b-load-once attribute AND script already loaded)
      !(!ae(b(w, "b-load-" + Us)) && Dr.has(b(w, "src")))
    ) {
      let d = yr(ee);
      pr(w, (_, A) => Ii(d, _, A, Or(_) && _)), d[Ee] = w[Ee], lt(w, Ni, d);
    }
  }), we(n, Ce, !0))
    for (let w of N) await e(w, s);
  return N;
}, Fl = (e, t = "", l = "") => {
  let i = t == dt ? FormData : URLSearchParams, a = new i(), f = (n, r = "") => {
    de(n) || F(n) ? C(ut(n), ([c, s]) => {
      let E = r ? `${r}[${c}]` : c;
      f(s, E);
    }) : a[ys](r, n);
  };
  return f(e, l), a;
}, Lt = (e) => async (t, l, i = {}) => {
  let a = "status", f = ms + "-Type", n = we(i, "parser");
  if (de(l)) {
    let r = i[zi] || {}, c = sr(oe(r), (E) => xe(E) == xe(f)), s = xe(r[c] || "");
    Et(r, c), e == rt || e == k ? (t += Fl(l), l = pe) : ji(s, "json") ? (l = nr(l), r[f] = "application/json") : ji(s, "form-data") ? l = Fl(l, dt) : l = Fl(l), i[zi] = r;
  }
  try {
    let r = await fetch(t, { ...i, [Br]: e, body: l }), c = await r[n || re]();
    if (!n)
      try {
        c = Ai(c);
      } catch {
      }
    if (!r.ok) {
      let s = new Error(`HTTP ${r[a]}! Status text: ` + r.statusText);
      throw s.response = r, s[_s] = c, s;
    }
    return c;
  } catch (r) {
    throw r;
  }
}, Al = {
  get: Lt(rt),
  post: Lt(kr),
  put: Lt(ks),
  [Bi]: Lt(Bi),
  [k]: Lt(k)
}, Wa = (e, t, l) => [
  // Set a route
  (i, a) => {
    if (Cl(a)) {
      i = nl(i, Ml);
      let f = Nt(G(i, "/"), B), n = D(f) - 1, r = e;
      C(f, (c, s) => {
        c in r || (r[c] = {}), r = r[c], s == n && (r[Ut] = a);
      });
    } else H(Os, "set route without a", Qe, wl, Te, i);
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
    if (!ze(nl(i), fl.origin))
      return fl.href = i, et;
    i = nl(i, Ml);
    let a = Nt(G(i, "/"), B), f = e, n = {}, r = 0;
    for (let c of a) {
      if (r = 0, c in f && !ze(c, ":"))
        f = f[c], r = 1;
      else for (let s of oe(f))
        if (ze(s, ":")) {
          let [E, T] = Nt(G(s, ":"), B);
          if (!T || T && T in t && t[T](c)) {
            let u = n[E];
            u ? F(u) ? v(u, c) : n[E] = [u, c] : n[E] = c, f = f[s], r = 1;
            break;
          }
        }
      if (!r) break;
    }
    return r = r && f[Ut] ? 1 : 0, r ? f[Ut]({
      params: n,
      path: i,
      [ft]: () => Et(f, Ut)
    }) : l(Al.get(i), pi, It), i != fl[Ml] && history.pushState(et, "", i), !!r;
  }
];
const qa = je([
  // ECMAScript reserved keywords
  "break",
  "case",
  "catch",
  Ns,
  "const",
  "continue",
  "debugger",
  "default",
  k,
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
  zs,
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
let Jl = /^[a-z_$][\w$]*$/i, Xa = (e) => {
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
  for (let T of i) {
    let u;
    for (; (u = T.exec(e)) !== null; ) {
      let y = u[1];
      if (y) {
        let o = X(G(y, ","), (S) => Z(B(S), /=.*$/, ""));
        for (let S of o)
          Pl(S, Jl) && l.add(S);
      }
    }
  }
  let a = [], f = /(['"`])(?:\\[\s\S]|(?!\1)[^\\])*\1/g, n = /\$\{([\s\S]*?)\}/g, r;
  for (; (r = f.exec(e)) !== null; ) {
    let T = r[1], u = r[We], y = u + D(r[0]);
    if (T === "`") {
      let o = r[0], S = r[We], h = 0, $;
      for (; ($ = n.exec(o)) !== null; ) {
        let L = $[We] + 2, Q = L + D($[0]) - 3;
        L > h && v(a, [
          S + h,
          S + L
        ]), h = Q;
      }
      h < D(o) && v(a, [
        S + h,
        S + D(o)
      ]);
    } else
      v(a, [u, y]);
  }
  let c = je(), s = /\b([a-z_$][\w$]*)\s*:/gi;
  for (; (r = s.exec(e)) !== null; )
    Ji(a, r[We]) || c.add(r[1]);
  let E = [];
  for (; (r = t.exec(e)) !== null; ) {
    let T = r[0], u = r[We], y = e[u - 1];
    qa.has(T) || l.has(T) || y === "." || c.has(T) || Ji(a, u) || v(E, [
      T,
      u,
      // start index of the variable
      u + D(T)
      // end index of the variable
    ]);
  }
  return E;
}, Ji = (e, t) => ar(e, ([l, i]) => t >= l && t < i), Ar = (e, t) => {
  let l = Xa(t), i = "", a = 0, f = e.ctx;
  for (let [n, r, c] of l)
    if (!(n in f)) {
      for (let s of [zt, jl, Wl, ps, Rs])
        if (f[s] && n in f[s]) {
          i += ie(t, a, r) + `${s}.${n}`, a = c;
          break;
        }
    }
  return i + ie(t, a);
}, Va = (e) => Pi(({ [ue]: t, prop: l }) => (Xt(t)[se].add(l), e)), Zl = !1, bl = [], _r = (e) => (bl = [], Zl = !0, e({}), Zl = !1, [...bl]), mr = (e) => {
  let t = _r(e), l = D(t);
  if (l) {
    let [i, a] = t[l - 1];
    return (f) => Kt(f) ? i[a] : i[a] = f;
  }
}, ye = (e, t) => {
  if (!Zi(e) || qt(e)) return e;
  let l = we(t, Ge, et);
  t = { [Ge]: l };
  let i = {
    get(r, c) {
      return Zl && (K(r, c) || !(c in r)) && v(bl, [a, c]), gt.get(r, c, a);
    },
    set(r, c, s) {
      c in r || V(r, c);
      let E = a[c];
      if (E === s) return !0;
      let T = Xt(a), u = {
        [Ye]: r,
        [ue]: a,
        prop: c,
        [Mt]: E
        // [NEW_VALUE]: newValue,
        // [OPERATION]: UNDEFINED,
      };
      _i(u, "wc"), vt.has(s) && (vt[k](s), s = s(u)), f.has(c) || (s = ye(s)), u[Ot] = s, Qa(u);
      let y = gt.set(r, c, s, a);
      return bi(T, u), y;
    },
    [Yi](r, c) {
      let s = r[c], E = gt[Yi](r, c);
      return bi(Xt(a), {
        [Ye]: r,
        [ue]: a,
        prop: c,
        [Mt]: s,
        [Ot]: pe,
        [oi]: k
      }), E;
    },
    [ql](r, c, s) {
      let E = s[P], T = a[c];
      return vt.has(E) && (s[P] = E({ [ue]: a, prop: c, [Ot]: E, [Mt]: T })), !f.has(c) && P in s && (s[P] = ye(s[P])), gt[ql](r, c, s);
    }
  };
  const a = new Proxy(qt(l) ? $a(l, e) : e, i), f = je();
  let n = {
    // [PARENT]: parent,
    // [TARGET]: target,
    // proxied,
    [ue]: Me(),
    [_e]: {},
    skip: f
    // refs: [],
    // [ON_SET]: {},
  };
  $l.set(a, n);
  for (let r in e) {
    let c = e[r];
    vt.has(c) && (c = c({
      [Ye]: e,
      [ue]: a,
      prop: r,
      [Mt]: pe
    })), !f.has(r) && Zi(c) && gt.set(e, r, c, a);
  }
  return a;
}, Zi = (e) => F(e) || de(e), bi = (e, t) => {
  let l = Me(), i = e[_e][t.prop];
  i && C(i, (f, n) => l.set(n, f)), C(e[ue], (f, n) => l.set(n, f));
  let a = tt(l);
  ir(a, Ra);
  for (let [f] of a) f(t);
}, Qa = (e) => {
  e[oi] = Kt(e[Mt]) ? mt : Kt(e[Ot]) ? k : js;
}, Ir = "getItem", wr = "setItem", ei = Me(), Ja = (e) => {
  let t = ga(e);
  return t && K(t, Ir) && K(t, wr);
}, ti = (e, t) => Ai(e[Ir](t) || ""), es = (e, t, l) => e[wr](t, nr(l)), ts = (e) => "_b_" + e, Pr = (e, t, l) => Ja(e) ? (l && (l = ts(l), K(e, l) && (t = ti(e, l))), Pi(({ [ue]: a, prop: f }) => (ei.set(l, [a, f, e]), l = l || ts(f), K(e, l) ? t = ti(e, l) : es(e, l, t), Le(() => Yt(a, f, () => {
  es(e, l, a[f]);
})), t))) : H(ol, yi, Jt), Za = (e) => {
  if (ei.has(e.key)) {
    let [t, l, i] = ei.get(e.key);
    i === e[Ea] && (t[l] = ti(i, e.key));
  }
}, Ht = (e, t, l = 0) => {
  let i = [], a = _r(t || e);
  return C(a, ([f, n]) => {
    v(i, Cr(f, n, e, l));
  }), t && e({}), () => C(i, (f) => f());
}, Yt = (e, t, l, i = 0) => {
  let a;
  return qt(e) ? /*hasProp(proxied, prop as string)*/ t || t === 0 ? a = Cr(e, t, l, i) : a = ba(e, l, i) : (H(Os + `watch non-${ue} ${Jt}/${_t}.`), a = () => {
  }), a;
}, $l = Me(), vt = je(), Pi = (e) => vt.add(e) && e, qt = (e) => $l.has(e), Xt = (e) => $l.get(e), li = (e) => $l[k](e), ba = (e, t, l = 0) => {
  if (qt(e)) {
    let i = Xt(e)[ue];
    return i.set(t, l), () => i[k](t);
  }
}, Cr = (e, t, l, i = 0) => {
  let a = Xt(e)[_e];
  return a[t] || (a[t] = Me()), a[t].set(l, i), () => a[t][k](l);
};
V(ye, "persist", (e, t) => Pr(localStorage, e, t), "wc");
V(ye, "session", (e, t) => Pr(sessionStorage, e, t), "wc");
V(ye, "init", Pi, "wc");
V(ye, se, Va, "wc");
let dr = (e, t, l = !0) => new Function(e, l ? `return(${t})` : t), ef = (e, t) => t ? cr(e) : Vt(e), xl = (e, t = "", l = !0) => (Na(e) && !l && (e += `(${t})`), fr(e) || (e = ef(e, l == re), e = `(${t})=>` + (l ? `(${e})` : `{${e}}`)), e), Bl = "required", ls = "matches", is = "\\p{L}", tf = "\\p{Nd}", lf = ur(Xl(Xl("^(?!.*\\.{2})[w._%+-]+@(?:[w](?:[w-]*[w])?\\.)+[l]{2,}$", /w/, is + tf), /l/, is), "u"), sf = (e) => {
  let t = {}, l = {};
  e || (e = {});
  let i = (s, E, T) => {
    let u = !1;
    return (te(s) || F(s)) && (u = T ? D(s) >= E : D(s) <= E), hl(s) && (u = T ? s >= E : s <= E), u;
  }, a = {
    [Bl]: (s) => !!s || s === 0,
    min: (s, E) => i(s, E, !0),
    max: (s, E) => i(s, E, !1),
    [al]: (s) => te(s) && Re(s, lf),
    same: (s, E, T) => s === T[E],
    in: (s, E) => F(E) && M(E, s),
    [ls]: (s, E) => te(s) && Re(s, E),
    type: (s, E) => a.in(wt(s), F(E) ? E : [E])
  }, f = {
    [Bl]: (s) => Ne(s, "is", Bl + "."),
    min: (s, E) => Ne(s, Ue, "at least", E + "."),
    max: (s, E) => Ne(s, Ue, "at most", E + "."),
    [al]: (s) => Ne(s, Ue, Ss, al + "."),
    same: (s, E) => Ne(s, "must match", E + "."),
    in: (s, E) => Ne(s, Ue, "equal to", le(E, " or ") + "."),
    [ls]: (s) => s + " has an invalid format.",
    type: (s, E) => Ne(s, Ue, Js, (F(E) ? le(E, " or ") : E) + ".")
  }, n = (s, E) => {
    t[s] = E;
  }, r = (s, E, T) => {
    a[s] = E, T && (f[s] = T);
  }, c = () => {
    mi(l);
    for (let [s, E] of ut(t)) {
      let T = e[s];
      for (let u of E) {
        let y = "", o = "", S = "";
        te(u) ? y = u : de(u) && (y = u[Ls], o = u[P], S = u[gs]);
        let h = a[y];
        if (!h) {
          dl("Unknown rule: " + y);
          continue;
        }
        h(T, o, e) || (l[s] || (l[s] = []), S ? v(l[s], S) : v(l[s], f[y](s, o, e) || s + " is invalid."));
      }
    }
    return !Bt(l);
  };
  return {
    prop: n,
    rule: r,
    [Ws]: c,
    errors: l
  };
}, Ut = Ca(il), Ci = {}, Dr = je(), bf = () => {
  let e = (p) => u.get(p), t = (p, O = () => !0) => {
    let R = p ? Wt(p) : et;
    for (; R; ) {
      let I = e(R);
      if (I && O(I)) return I;
      R = Wt(R);
    }
  }, l = (p, O) => {
    let R = e(p);
    if (!R) {
      let I = O ? e(O) : t(O || p);
      R = {
        // Local context
        // @ts-ignore
        ctx: { ...A },
        // A reference to the element. Convenience for internal use.
        el: p,
        [Ge]: I,
        // UID context
        uid: we(I, "uid", {}),
        /** Attributes or directives */
        attr: {},
        /** Cleanup functions */
        cFns: [],
        /**
         * Skip the hydration process
         * - 0: not hydrated (default)
         * - 1: skip self
         * - 2: skip children
         * - 3: skip self and children
         */
        [se]: 0,
        ..._,
        ...Y
      };
      for (let m in Q) {
        let x = Q[m](R, I);
        x && V(R.ctx, m, x, "c");
      }
      u.set(p, R), R[fe] = rf(R, U + fe)();
    }
    return R;
  }, i = (p, O, R, I) => {
    let m = I(p.el), x = T(p, R);
    g(p, Ht(() => m(x)));
  }, a = async (p, O) => {
    te(p) && (p = q(p)), te(O) && (O = q(O)), Pt(O) || (O = pe), Pt(p) && (await c(p), await Nl(p, async (R) => {
      let I = !1, m = p == R ? O : pe;
      return Pa(R) && Rr(R) ? I = n(R, m) : ct(R) && (ge(R) == ee && ae(b(R, U + ee)) ? I = !1 : I = await r(R, m)), I;
    }));
  }, f = (p, O = !0, R = !0) => {
    Nl(p, (I) => {
      let m = e(I);
      return m && (m[Ae] && C(m[Ae], (x) => m[Gt](x, O, R)), m.ph && jt(m.ph), C(m.cFns, (x) => x()), R && u[k](I), O && jt(I)), !0;
    });
  }, n = (p, O) => {
    let R = p[Je], I = $r(Vt(R || ""));
    if (I && Re(I, cl)) {
      let m = l(p, O), x = T(m, I, "", re);
      g(m, Ht(() => p[Je] = x())), ii(m, re, R);
    }
    return !1;
  }, r = async (p, O) => {
    let R = l(p, O);
    if (ve(R, 3)) return !0;
    for (let [I, m] of y) {
      let x = [];
      if (wa(I))
        pr(p, (he, bt) => {
          Re(he, I) && v(x, [he, bt]);
        });
      else {
        let he = b(p, I);
        ae(he) || v(x, [I, he]);
      }
      for (let [he, bt] of x) {
        if (ve(R, 1) || ve(R, 3)) break;
        ii(R, he, bt), await m(R, he, Vt(bt));
      }
      if (ve(R, 1) || ve(R, 3)) break;
    }
    return ve(R, 0) && (R[se] = 1), !Bt(R[Pe]) && !O && u[k](p), !ve(R, 2) && !ve(R, 3);
  }, c = async (p) => {
    let O = await xr(p, Ur, []);
    C(O, ([R, I]) => {
      let m = ge(I), x = m != ee && m != z ? $e : m, he = I[x == $e ? Ve : Ee];
      Y[x][R] = B(he);
    });
  }, s = (p) => (O, R) => {
    Y[p][O] = R;
  }, E = (p, O, R = "", I = !0) => {
    let m;
    return O = Ar(p, xl(O, R, I)), O in L ? m = L[O] : (m = Zt(), $[m] = dr(Se, O), L[O] = m), m;
  }, T = (p, O, R = "", I = !0) => {
    let m;
    try {
      let x = O in $ ? O : E(p, O, R, I);
      m = $[x](p.ctx);
    } catch (x) {
      H(x[gs]), m = () => Ut;
    }
    return m;
  }, u = Me(), y = [], o = {}, S = {}, h = { [ce]: Oa }, $ = {}, L = {}, Q = {
    // The element itself
    $el: (p) => p.el,
    // Unique identifier for the element
    $uid: (p) => p.uid,
    // Reactive properties defined in the element or inherited from the parent context
    [Wl]: ss(Wl, U + _e, !0),
    // The $data context
    [jl]: ss(jl, Ke),
    // Data Level Context:
    // Referenced under the same $data context, not including nested $data contexts
    [Hl]: rs(Hl),
    [Yl]: rs(Yl),
    // The $each context
    [zt]: (p, O) => O == null ? void 0 : O.ctx[zt],
    $cleanup: (p) => (O) => g(p, O)
  }, J = ja(a, f, o), [N, w] = Wa(S, h, J);
  Ci[Qe] || as(w);
  let d = {
    [Qe]: N,
    router: as,
    [Gi]: s(Gi + "s"),
    [$e]: s($e),
    [z]: s(z),
    [ee]: s(ee),
    [_e]: s(_e),
    data: s(dt),
    mask: s(yl),
    [Qs]: s(Sl)
  }, _ = {
    [Ce]: a,
    [Gt]: f,
    [Qt]: J,
    [Qe]: w,
    emit: Ze,
    listen: me,
    query: q,
    queryAll: Dl,
    /** Get the local context of an element */
    context: (p) => {
      var O;
      return (O = e(q(p))) == null ? void 0 : O.ctx;
    }
  }, A = {
    $dom: _,
    $http: Al,
    $set: d,
    [ps]: ye({}),
    $state: ye,
    $watch: Yt,
    $effect: Ht,
    [Rs]: {
      hasProp: K,
      getProp: we,
      setProp: V,
      sync: kt,
      [As]: ke,
      [Ws]: sf
    }
  }, Se = `{${le(oe(A))},${le(oe(Q))}}`, Y = {
    [$e]: o,
    [z]: {},
    [ee]: {},
    [_e]: {},
    data: {},
    // ! HYDRATION
    [Vs]: y,
    bnodes: u,
    [yl]: {},
    [Sl]: {},
    routes: S,
    routeRules: h,
    // ! PUBLIC CONTEXT
    gc: A,
    // ! TOOLS
    exec: T,
    [Ds]: Se,
    [st]: i,
    bnode: [l, e]
    // insert,
    // route: [SetRoute, Route],
  };
  return C([d, _, Al, A, Y], (p) => _i(p, "wc")), Y;
}, ve = (e, t) => e[se] == t, g = (e, t) => {
  v(e.cFns, t);
}, Ct = (e, t) => {
  let l = e[Ge];
  l && (l[Ae] || (l[Ae] = []), M(l[Ae], t) || v(l[Ae], t));
}, rf = (e, t, l = "{}") => {
  let i = ct(e.el) ? b(e.el, t) : null;
  return ae(i) || ii(e, t, i), i = Vt(i || l), e.exec(e, i);
}, ii = (e, t, l) => {
  e[Pe][t] = l, ct(e.el) && wi(e.el, t);
}, Vt = (e) => Z(B(le(X(G(e, Te), (t) => ze(B(t), "//") ? "" : t), Te)), /;$/, ""), cl = /\${((?!.*\${).*?)}/, af = /{{((?!.*{{).*?)}}/, $r = (e, t = "${$1}") => Xl(e, af, t), ss = (e, t, l) => (i, a) => {
  let f = i.el, n = a ? a.ctx[e] : et, r = ct(f), c = r && !ae(b(f, t)), s = r && (i[Pe][Ie] || !ae(b(f, Ie))), E = r && (!n || c);
  return E && !c && t == Ke && Ii(f, Ke, ""), E && !s ? ye({}, { [Ge]: l && n }) : n || {};
}, rs = (e) => (t, l) => !l || ct(t.el) && !ae(b(t.el, Ke)) ? {} : l.ctx[e], as = (e) => {
  Cl(e) && (Ci[Qe] = () => e(nl()));
}, en = (e = {}) => {
  il in Fe || (_i(e, "wc"), V(Fe, il, e, "wc"), me(Fe, yi, Za), me(Fe, "pop" + ue, Ci[Qe]), Ze(Fe, il));
}, gl = (e, t) => ie(e, ze(e, U) ? t : t - 2), di = async (e) => {
  await fs(e, "b-slot"), await fs(e, ci);
}, fs = async (e, t) => {
  let l = t == ci, i = e.ctx[l ? Hl : Yl], a = l ? [Ie, qs, Oi, Ke] : [Ke];
  for (let f of e[Ae] || [e.el]) {
    let n = await xr(f, t, a);
    C(n, ([r, c]) => {
      i[r] = l ? c : c[Ve], g(e, () => Et(i, r));
    });
  }
}, xr = async (e, t, l) => {
  let i = [], a = t != ci;
  return await Nl(e, (f) => {
    if (ct(f)) {
      if (ar(l, (r) => !ae(b(f, r)))) return !1;
      let n = b(f, t);
      n && (wi(f, t), v(i, [n, f]), a && jt(f));
    }
    return !0;
  }, a), i;
}, ff = async (e, t) => {
  e[se] = 3;
}, nf = [vr, ff], cf = (e, t, l) => {
  let i = e.el, [a, f] = e.bnode;
  e[se] = 3;
  let [n, r] = X(G(l, " in "), B), [c, s] = X(G(n, ","), B);
  s || (s = We);
  let E = Ne("the", t, it, Ri);
  if (!Re(c, Jl) || !Re(s, Jl))
    return H(E, Ss, "alias.");
  let T = e.exec(e, r), u = mr(T), y = u ? u() : T(), o = u && qt(y), S = !1;
  if (hl(y) && (y = ye(Ki(y, 1)), S = !0, u && Ht(() => {
    let N = u();
    hl(N) && kt(y, Ki(N, 1));
  }, () => u())), !(F(y) || de(y)))
    return H(E, `an ${_t}, ${Jt}, or ${ce}.`);
  e.ph = Sr(t), lt(i, Ni, e.ph), Ct(e, i);
  let h = {}, $ = ([N, w]) => {
    let d = or(i);
    lt(e.ph, Xe, d);
    let _ = a(d, i);
    K(e[Pe], Ie) && (_[Pe][Ie] = "");
    let A = ye({});
    V(A, c, w, "c"), V(A, s, N, "c"), V(_.ctx, zt, A, "c"), g(_, () => {
      li(A);
    }), g(_, Yt(A, s, ({ [Ot]: Se }) => {
      let Y = h[N][1];
      Se !== Y && (A[s] = Y);
    })), o && g(_, Yt(A, c, () => {
      y[A[s]] = A[c];
    })), h[N] = [d, N], e[Ce](d, i);
  }, L = ([N, w]) => {
    let d = h[N], _ = f(d && d[0]);
    if (_) {
      let A = _.ctx[zt];
      A[c] = w, A[s] = N, d[1] = N;
    }
  }, Q = ([N, w]) => {
    let [d] = h[N];
    e[Gt](d), Et(h, N);
  }, J = {
    [mt]: $,
    [js]: L,
    [k]: Q
  };
  for (let N of ut(y))
    J[mt](N);
  u && g(e, Yt(y, pe, ({ [oi]: N, prop: w, [Ot]: d }) => {
    J[N]([w, d]);
  })), g(e, () => {
    for (let N in h)
      J[k]([Number(N), null]);
    S && li(y);
  });
}, Ef = [qs, cf], gr = async (e, t, l) => {
  let i = t == Ke, a = i ? dt : _e, f = e[a], n = e[Ge], r = l ? f[l] || e.exec(n || e, l) : () => ({}), c = e.ctx[At + a], s = await r((n == null ? void 0 : n.ctx) || e.ctx);
  if (!de(s))
    return e[se] = 3, H(tr(it, t, "an " + Jt, wt(s)));
  for (let E in s) V(c, E, s[E], xa(s, E));
  i && await di(e), g(e, () => {
    Le(() => {
      li(e.ctx[At + a]);
    });
  });
}, uf = [U + _e, gr], Tf = [Ke, gr], ns = {}, of = async (e, t, l) => {
  if (l) {
    let i = e.exec(e, l)();
    if (!F(i) || !rr(i, te))
      return H("the", t, it, Ue, `an ${_t} of ${qe}(s).`);
    e.uid = i.reduce((a, f) => {
      let n = Zt(5);
      return ns[n] = !0, V(a, f, n, "wc"), a;
    }, {}), g(e, () => {
      for (let a in e.uid) Et(ns, e.uid[a]);
    });
  }
}, pf = ["b-uid", of], Lr = (e) => (t, l, i) => {
  if (!(K(t[Pe], Oi) || K(t[Pe], Xs) && e == re)) {
    t[se] = 2;
    let a = t[$e];
    i in a && (i = cr(a[i] || i)), i && t[st](t, l, i, (f) => async (n) => {
      await t[Qt](n(), e, f, {
        [Ce]: !1
      }), e == Il && await di(t), t[se] = 1, t[Ce](f);
    });
  }
}, Rf = [Xs, Lr(Il)], yf = [Gr, Lr(re)], Sf = async (e, t, l) => {
  let i = e.el, a = l ? e[$e][l] || e.exec(e, l)() : i[Ee];
  if (e[se] = 2, te(a)) {
    e[Ae] = await e[Qt](B(a), Xe, i, {
      [Ce]: !1
    }), Ct(e, i), jt(i), await di(e);
    for (let f of e[Ae]) await e[Ce](f, i);
  } else dl(t + ":", ol, P, Te, a);
}, hf = [Oi, Sf], Of = async (e, t, l) => {
  let i = e.el, a = e[ee], f = ge(i) == ee;
  e[se] = 2;
  let n = l ? a[l] || e.exec(e, l)() : [];
  if (n = X(
    F(n) ? n : [n],
    (r) => a[r] || r
  ), Ct(e, i), f) {
    let r = b(i, "src");
    r && Dr.add(r);
    let c = r ? await Al.get(r) : Rr(i);
    c && v(n, Vt(c)), jt(i);
  }
  for (let r of n) {
    let c = r;
    if (te(c)) {
      let s = fr(c);
      c = dr(e[Ds], Ar(e, c), s), s && (c = c(e.ctx));
    }
    Cl(c) && await c(e.ctx);
  }
}, Nf = [U + ee, Of], Af = (e, t, l) => {
  let i = e.el;
  if (l && ge(i) != z) {
    let a = e[z], f = a[l] || e.exec(e, l)();
    f = X(
      F(f) ? f : [f],
      (c) => a[c] || c
    );
    let n = Zt();
    Ua(i, n);
    let r = yr(z);
    r[Je] = _f(le(f, Te), "." + n), e[Ce](r, i), lt(i, Be, r), g(e, () => {
      e[Gt](r);
    });
  }
}, _f = (e, t) => {
  e = Z(e, /\/\*[\s\S]*?\*\//g, ""), e = $r(e);
  let l = [], i = Zt();
  for (; Re(e, cl); ) {
    let c = Pl(e, cl);
    c && (v(l, c[0]), e = Z(e, cl, i));
  }
  let a = Nt(G(e, "}"), B), f = Te + "    ", r = le(X(a, (c) => {
    let [s, E] = G(c, "{"), T = X(
      X(G(s, ","), B),
      (u) => M(u, "&") ? Z(u, /&/g, t) : t + " " + u
    );
    return E = le(X(Nt(G(E || "", Te), B), B), f), le(T, ",") + ` {${f + E + Te}}`;
  }), Te);
  return C(l, (c) => {
    r = Z(r, i, c);
  }), r;
}, mf = [U + z, Af], If = (e, t, l) => {
  let i, a;
  try {
    i = q(l), Pt(i) && (l = xl(l, "", re));
  } catch {
  }
  e[st](e, t, l, (f) => (n) => {
    try {
      let r = n();
      F(r) ? [i, a] = r : i = q(r);
    } catch {
    }
    M([Xe, Be, Hr, ys], a) || (a = Be), Pt(i) ? (lt(i, a, ...e[Ae] || [f]), Ct(e, f)) : dl(Gs, be, Kl, t + `="${l}"`);
  });
}, wf = [U + Gs, If], Di = Zt(), Pf = (e, t, l) => {
  if (!(K(e[Pe], Ie) ? Ie : K(e[Pe], sl) ? sl : ""))
    return H("the", t, it, Ue, "used with", Ie, "or", sl + ".");
  let a = e.exec(e, l)();
  if (F(a) || D(a) == 2) {
    let f = df(e.el, ...a);
    e[fe][Di] = f, g(e, f[ft]);
  }
}, Cf = [U + ht, Pf], df = (e, t, l) => {
  if (!ct(e))
    return H(ol, ht, be, e);
  let i = null, a = 1, f = 2, n = 3, r = 4, c = a, s = {
    [ht]: ["none", "important"]
  }, E = Nr(e[z]), T, u, y, o, S, h, $ = () => {
    if (T = Qi(t), o = Qi(l), !T || !o)
      return H(ol, ht, W + "ors:", `'${t}' and '${l}'`, Ue, "valid CSS", W + "ors.");
    [u, y] = Vi(T), [S, h] = Vi(o);
  }, L, Q = me(e, ht + Ft, (N) => {
    N[Ye] === e && (c == f ? (c = r, i && (Oe(e, T), ne(e, E))) : c == n && (c = a, i || (Oe(e, o), ne(e, E))), L && L());
  }), J = (N, w) => {
    L = w, !(N && i && c == r || !N && i === !1 && c == r) && ($(), N ? i === null || i && c == a || i === !1 && c == r ? (i = !0, c = f, Oe(e, o, u), ne(e, y, s), Ul(() => {
      Oe(e, y, s), ne(e, u);
    })) : !i && c == f ? (c = n, Oe(e, h), ne(e, S)) : i && c == n && (c = f, Oe(e, y), ne(e, u)) : (i === null && (i = !1, c = r, Oe(e, T, S), ne(e, h, s), Ul(() => {
      Oe(e, s);
    })), !i && c == a || i && c == r ? (i = !1, c = f, Oe(e, T), ne(e, s), Ul(() => {
      Oe(e, s), ne(e, o);
    })) : i && c == f ? (c = n, ne(e, T)) : !i && c == n && (c = f, ne(e, o))));
  };
  return V(J, ft, Q), J;
}, Df = (e, t, l) => {
  let i = e.el;
  e.ph = Sr(t), lt(i, Ni, e.ph), e[se] = 3, Ct(e, i);
  let [a] = e.bnode, f, n, r = () => {
    e[Gt](f.el), f = pe;
  };
  e[st](e, t, l, () => (c) => {
    let s = c();
    Le(async () => {
      if (s) {
        if (!f) {
          let E = or(i);
          lt(e.ph, Be, E), f = a(E, i), f[Pe][Ie] = "", await e[Ce](E, i), Ct(e, E);
        }
        n = f[fe][Di], n && n(!0);
      } else !s && f && (n ? n(!1, r) : r());
    });
  });
}, $f = [Ie, Df], xf = (e, t, l) => {
  let i = hr(e.el)[Tl];
  i == "none" && (i = "block"), e[st](e, t, l, (a) => (f) => {
    let n = f();
    Wt(a) && Le(() => {
      let r = e[fe][Di];
      n ? (a[z][Tl] = i, r && r(!0)) : r ? r(!1, () => cs(a)) : cs(a);
    });
  });
}, gf = [sl, xf], cs = (e) => {
  e[z][Tl] = "none";
}, el = (e, t, l) => {
  let i = gl(t, 5), [a] = G(i, "-"), f = e[fe][t] || {}, n = e.el, r = e.exec(e, l, "$entry", !1), c = Ol(r, f[ul] || 100), s = new IntersectionObserver((E) => {
    C(E, (T) => {
      T.isIntersecting != (a == ds) && (c(T), f[Us] && s[zl]());
    });
  }, f);
  s[vs](n), g(e, () => s[zl]());
}, Lf = [
  [vi, el],
  [U + vi, el],
  [Ui, el],
  [U + Ui, el]
], Es = (e, t, l) => {
  let i = gl(t, 5);
  G(i, "-");
  let a = e.el, f = e[fe][t] || {}, n = f[ui] ? q(It) : a, r = e.exec(e, l, "$size", !1), c = Ol(r, f[ul] || 100), s = new ResizeObserver((E) => {
    let T = E[0].borderBoxSize[0];
    c([T.inlineSize, T.blockSize]);
  });
  s[vs](n, f), g(e, () => s[zl]());
}, Mf = [
  [Fi, Es],
  [U + Fi, Es]
], ot = "keyup", pt = "keydown", us = "outside", vf = "window", Mr = "control", si = "meta", tl = "arrow", Ts = [
  si,
  Mr,
  "shift",
  "alt",
  "fn"
], Uf = {
  ctrl: Mr,
  cmd: si,
  [zs]: si,
  esc: "escape",
  del: k,
  up: tl + "up",
  down: tl + "down",
  left: tl + "left",
  right: tl + "right"
}, Ff = (e, t, l) => {
  let i = gl(t, 5), [a, ...f] = G(i, "-"), n = e.el, r = n, c = (o) => {
    let S = e.exec(e, l, At + Li, !1);
    Cl(S) ? S(o) : H(tr(Li, t, "a " + wl, wt(S())));
  }, s = e[fe][t] || {};
  C(f, (o) => {
    s[o] = !0;
  }), ul in s && (c = Ol(c, s[ul])), Hi in s && (c = Ma(c, s[Hi])), s[us] || s[ui] ? r = xt : s[vf] && (r = Fe);
  let E = {};
  M([pt, ot], a) && C(we(s, "keys", []), (o) => {
    E[Uf[o] || o] = !0;
  });
  let T = Bt(E), u = a;
  if (M([pt, ot], a) && T) {
    let o = {};
    a = t;
    let S = Ol((h) => {
      Ze(r, a, h);
    }, 600);
    g(e, me(r, pt, (h) => {
      let $ = xe(h.key);
      o[$] || (o[$] = !0), Le(() => {
        o.meta && !M(Ts, $) && kl(h, o);
      });
      let L = oe(o);
      T > 1 && ot == u && o.meta && !M(Ts, $) ? S(L) : pt == u && Ze(r, a, L);
    })), g(e, me(r, ot, (h) => {
      pt == u && kl(h, o), Ze(r, a, oe(o)), ot == u && kl(h, o);
    })), g(e, me(r, "focus", () => {
      mi(o);
    }));
  }
  g(e, me(r, a, (o) => {
    if (s[Fs] && o[ia](), s.stop && o.stopPropagation(), !(s.self && o[Ye] !== o.currentTarget) && !(s[us] && (n.contains(o[Ye]) || !Ha(n)))) {
      if (M([pt, ot], u)) {
        let S = o[Is];
        if (!(Bt(E) == Bt(S) && rr(oe(E), (h) => M(S, h))))
          return;
      }
      c(o);
    }
  }, s));
}, kl = (e, t) => Et(t, xe(e.key)), Bf = [/^(b-on-|on-)[\w-]+$/, Ff], kf = (e, t, l) => {
  let i = gl(t, 7);
  l = xl(l || Aa(i), "$initial"), i = za(i);
  let a = b(e.el, i), f = e[fe][t] || {};
  e[st](e, t, l, (n) => (r) => {
    let c = r(a || ""), s = f.prop || Or(i) && i;
    c || s ? Ii(n, i, !s && c === !0 ? "" : c, s) : wi(n, i);
  });
}, Hf = [/^(b-bind-|bind-)[\w-$]+$/, kf], ll = Me(), Yf = (e, t, l) => {
  let i = Ne("the", t, it), a = Ne(Ri, "a reactive", P), f = W + "ed", n = e.el, r = ge(n), c = n.type;
  if (!M([j, yt, W], r))
    return H(i, hs, j, `, ${yt}, and ${W} ${be}s.`, n);
  let s = mr(e.exec(e, l));
  if (!s)
    return H(i, a, n);
  let E = s(), T, u = () => tt(r == W ? n[fe] : $()), y = e[fe][t] || {}, o = (_) => {
    let A = _[ae(b(_, P)) && h ? Rt : P], Se = ll.get(_) || y;
    if (te(A) && (Se.trim && (A = B(A)), !Se.raw)) {
      let Y = Ai(A);
      (hl(Y) || ae(Y) || Ia(Y)) && (A = Y);
    }
    return A;
  }, S = (_) => r == j && M(_, c), h = S([Tt, ki]), $ = () => Dl(j + `[type="${Tt}"][name="${n.name}"]`), L = () => S(Tt) && D($()) > 1, Q = () => {
    let _ = [
      [j, Tt, [ce, qe, rl, _t]],
      [j, ki, [ce, qe, rl]],
      [j, ce, [ce]],
      [j, "range", [ce]],
      [j, "", [ce, qe]],
      [yt, "", [ce, qe]],
      [W, "", [ce, qe, rl, _t]]
    ];
    for (let [A, Se, Y] of _)
      if (r == A && (!Se || c == Se)) {
        ae(E) || Kt(E) || M(Y, wt(E)) || dl(i, a, Js, le(Y, " or "), `for ${r == j ? c + " " : ""}${A} ${be}s,`, lr(wt(E)), n);
        break;
      }
  };
  Le(() => {
    Q(), W == r ? C(u(), (_) => ll.set(_, y)) : S(Tt) && ll.set(n, y);
  }, 1);
  let J = () => {
    if (E = s(), T = o(n), M([j, yt], r))
      if (c == Tt && F(E))
        n[Rt] = M(E, T);
      else if (h)
        n[Rt] = E === T;
      else {
        if (n[Rl] || xt.activeElement === n && E === T) return;
        E !== T && (n[P] = E);
      }
    else r == W && (F(E) ? C(u(), (_) => {
      _[f] = M(E, o(_));
    }) : n[P] = E);
  };
  Le(() => g(e, Ht(J)), 5);
  let N = {}, w = () => {
    if (E = s(), r == W && n.multiple || L()) {
      let _ = [];
      C(u(), (A) => {
        r == W && ll.set(A, y), (A[f] || A[Rt]) && v(_, o(A));
      }), s(_);
    } else s(h && !n[Rt] ? !1 : o(n));
  };
  (S([re, "search", "url", "tel", al, "password"]) || r == yt) && (N[Wr] = Ba, N[qr] = ka);
  let d = y.lazy || h || r == W ? "change" : j;
  N[d] = w;
  for (let [_, A] of ut(N))
    g(e, me(n, _, A));
}, zf = ["b-model", Yf], Gf = (e) => {
  e["#"] = new RegExp("\\p{Nd}", "u"), e["&"] = /[\p{L}]/u, e["*"] = /[\p{L}\p{Nd}]/u;
}, El = "output", He = "cursor", $i = "character", ri = "quantifier", _l = "isToken", ml = "isOptional", ai = "isMultiple", fi = "parts", Kf = (e, t, l) => {
  let i = e.el, a = e[yl];
  if (!(P in i && vl in i))
    return H("the", t, it, hs, yt, be + "s and textual", j, "types (text, email, etc.).");
  let f = a[l], n = e[fe][t] || {}, r = {
    ...n,
    [pl]: { ...e[Sl], ...n[pl] },
    mask: l,
    [P]: "",
    [He]: i[vl],
    [fi]: [],
    [El]: ""
  }, c = () => {
    r[P] = i[P], r[P] != r[El] && (r[fi] = [], r[He] = i[vl], f && f(r), qf(r), i[P] = r[El], i.setSelectionRange(r[He], r[He]), Ze(i, Dt, r));
  };
  Le(c, 7), g(e, me(i, j, c, !0));
}, jf = (e, t) => {
  let l = [], i = "\\";
  for (let a = 0; a < D(e); a++) {
    let f = e[a], n = {
      [$i]: f,
      [ri]: 1,
      [_l]: !1,
      [ml]: !1,
      [ai]: !1
    };
    if (f != i || f == i && e[a + 1] == i) {
      if (M(oe(t), f) && (e[a - 1] != i || e[a - 2] == i)) {
        let r = Pl(ie(e, a + 1), /^\d+/);
        if (r) {
          let s = r[0];
          a += D(s), n[ri] = +s;
        }
        n[_l] = !0;
        let c = e[a + 1];
        (c == "?" || c == "+") && (n[ml] = c == "?", n[ai] = c == "+", a++);
      }
      v(l, n);
    }
  }
  return l;
}, Wf = (e, t) => sr(ie(e, t + 1), (l) => !l[ml]), os = (e, t, l) => {
  let i = -1;
  if (t) {
    let a = t[$i];
    if (t[_l]) {
      let f = Pl(e, l[a]);
      f && (i = f[We]);
    } else i = pa(e, a);
  }
  return i;
}, qf = (e) => {
  let t = e[pl], l = e[P], i = e[He], a = jf(e[Dt], t), f = "", n = l, r = ie(l, i);
  for (let [c, s] of ut(a)) {
    let E = s[$i], T = s[ri];
    if (s[_l]) {
      if (T > 0) {
        if (!n) break;
        let u = "";
        for (; n && (T > 0 || s[ai]); ) {
          let y = s[ml] || T < 1, o = os(n, s, t), S = y && o > 0 && Wf(a, +c), h = os(n, S, t);
          if (o < 0 || h >= 0 && o > h) {
            y || (n = "");
            break;
          }
          o || (u += n[0], T--), n = ie(n, 1), r == n && (i = D(f + u));
        }
        f += u, s[P] = u;
      }
    } else n && (r == n && (i = D(f)), f += E, s[P] = E, n[0] == E && (n = ie(n, 1)));
  }
  e[He] = e[He] == 0 ? 0 : e[He] == D(e[P]) ? D(f) : i, e[El] = f, e[fi] = a;
}, Xf = (e) => {
  let t = e[P], l = we(e, "decimal", "."), i = we(e, "thousands", ","), a = we(e, "precision", 2);
  l == "," && (i = "."), i == "." && (l = ",");
  let f = G(t, l), n = f[0], r = ze(n, "-");
  n = Z(n, /\D/g, ""), n = n && (Z(n, /^0+/, "") || "0");
  let c = D(f) > 1, s = c ? le(ie(f, 1), l) : "", E = D(n), T = r ? "-" : "";
  for (let S = 0; S < E; S++)
    S > 0 && (E - S) % 3 == 0 && (T += i), T += "#";
  let u = e[pl];
  t = r ? "-" + n : n, a > 0 && (u[l] = ur(`\\${l}`), c && (t += l + s), T += l + "#" + a), e[Dt] = T, r && (u["-"] = /-/), u["#"] = /\d/;
  let y = 0, o = "";
  for (let S of e[P])
    S == t[y] ? (o += S, y++) : o += "∅";
  e[P] = o;
}, Vf = [U + Dt, Kf], Qf = (e, t, l) => {
  l = xl(l, "", !1), e[st](e, t, l, () => async (i) => {
    await i();
  });
}, Jf = ["b-effect", Qf], Zf = [
  /**
   * The b-ignore directive is used to stop the hydration of the element and its children.
   */
  nf,
  /**
   * Conditional hydration
   * Notes:
   * - b-if stops the hydration flow of the element and starts a new hydration flow with a copy of the element whenever the condition evaluates to true
   * - the original element is replaced with a placeholder comment node to hold its location in the DOM
   * - whenever the condition evaluates to false, the copy of the element is dehydrated and removed from the DOM
   */
  $f,
  /**
   * Context directives
   * Notes:
   * - the order of inference is: $each, $data, $props, $store, $tools
   */
  uf,
  Tf,
  /** List rendering
   * Notes:
   * - b-each stops the hydration flow of the element and starts a new hydration flow for each item it creates
   */
  Ef,
  /**
   * Unique ID generator
   */
  pf,
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
  hf,
  /**
   * Conditional display
   * Notes:
   * - the element is hydrated regardless of the condition
   * - the b-show directive toggles the `display` of the element based on the condition
   */
  gf,
  /**
   * The b-teleport moves the element to a different location in the DOM.
   * Notes:
   * - b-teleport also works with the b-if and b-template directives
   */
  wf,
  /**
   * Run one or more scripts on the element
   * Notes:
   * - the b-script directive may hold one script or an array of scripts
   * - the script(s) are executed in order and awaited
   * - when b-script is in a script element the content of the src file or text content is added to the list of scripts to be executed
   */
  Nf,
  /**
   * Dynamic hydration of HTML or text content and styles
   * Notes:
   * - if the element has a b-html and b-text directive, the b-html directive is hydrated and the b-text directive is ignored
   * - b-style always hydrates regardless of the b-html and b-text directives
   */
  Rf,
  yf,
  /**
   * Dynamic insertion of styles
   * Notes:
   * - the style element is inserted after the element that contains the b-style directive
   */
  mf,
  /**
   * Data binding directives
   * Used to bind data to an element's property or attribute
   * 
   * - The `b-bind-|bind-` directive is a general directive used to bind data to an element property or attribute
   * - The `b-model` directive is used to create a two-way data binding between an input value and a reactive property
   * - The `b-mask` directive is used to format an input value using a mask
   */
  Hf,
  // [b-bind|bind]-[attributeName]
  zf,
  Vf,
  // ['b-boost', hydrateBoost],
  Cf,
  // b-transition, b-transition-play, b-transition-reverse
  ...Lf,
  // [b-on|on]-enter, [b-on|on]-exit
  ...Mf,
  // [b-on|on]-resize
  Bf,
  // [b-on|on]-[eventName]
  /**
   * b-effect: used to create an effect that run when its dependencies change.
   * It is perfect for small expressions, reactive or not.
   * Example: console.log(`Hello, ${$data.name}!`)
   */
  Jf
], tn = (e) => {
  C(Zf, (t) => v(e[Vs], t)), e[yl].money = Xf, Gf(e[Sl]);
};
export {
  Hf as bindDirective,
  Tf as dataDirective,
  Ef as eachDirective,
  Rf as htmlDirective,
  $f as ifDirective,
  nf as ignoreDirective,
  Lf as intersectionDirectives,
  Vf as maskDirective,
  zf as modelDirective,
  Xf as moneyMask,
  bf as newApp,
  Bf as onDirective,
  uf as propsDirective,
  Mf as resizeDirectives,
  Nf as scriptDirective,
  tn as setAllDirectives,
  Gf as setDefaultMaskTokens,
  Ci as settings,
  en as setup,
  gf as showDirective,
  mf as styleDirective,
  wf as teleportDirective,
  hf as templateDirective,
  Cf as transitionDirective,
  pf as uidDirective
};
//# sourceMappingURL=briojs.1.1.6.js.map
