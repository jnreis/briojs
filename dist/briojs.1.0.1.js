let El = "brio", Ct = "$", Ns = "$store", Ps = "$tools", Me = "after", $s = "append", Dt = "array", ye = "attr", yi = "Attribute", Cs = "a valid", H = "b-", ge = "b-if", Ds = "b-ignore", zt = "b-save", ol = "b-show", Ze = "before", vl = "begin", Br = "body", ul = "boolean", Yr = "cache", ds = "can only be used on", gs = "Cannot ", ht = "checkbox", At = "checked", ms = "class", xs = "clone", Bi = "closest", hi = "composi", Ri = "content", ks = "Content", et = "create", Lt = "data", Sl = "debounce", Ls = "detail", Ms = "define", U = "delete", ct = "directive", jl = "disconnect", Al = "display", Si = "document", Hs = "each", Ye = "element", Tl = "email", Wt = "end", Yi = "entries", zi = "error", Et = "evalEffect", Gi = "event", vs = "EventListener", Us = "exit", Ai = "ctxArgs", ot = "get", Fs = "head", Ki = "href", dt = "html", Bs = "HTML", st = "hydrate", _t = "index", gl = "inner", ll = "insert", Ol = "Invalid", Wl = "length", Mt = "mask", Ys = "message", zr = "method", ke = "must be", He = `
`, It = "newValue", zs = "name", Gs = "Node", de = "nodes", _l = "not found.", rt = null, oe = "number", il = "object", Ks = "observe", Gt = "oldValue", Oi = "on-", ji = Oi + "enter", Wi = Oi + Us, qi = Oi + "resize", js = "once", _i = "operation", ce = "options", wi = "outer", ft = "parent", Xi = "patch", Gr = "pause", Kr = "post", jr = "prepend", Ws = "prevent", qs = "Propert", ut = qs + "y", Ne = "props", Xs = "put", Vi = "radio", We = "remove", Vs = "replace", Ii = "requires", tt = "route", b = "script", qe = "skip", V = "select", ue = "state", Qs = "start", Ni = "storage", Qe = "string", G = "style", Js = "super", Zs = "teleport", ie = "template", Oe = "text", Qi = "throttle", Pi = "tion", Wr = "toString", wl = "tokens", wt = "transition", bs = "type", he, ql = "update", er = "validate", D = "value", $i = "With", qr = "add" + vs, Xl = Ct + Lt, Jt = Ct + Hs, Vl = Ct + Ne, ze = H + Lt, Xr = H + Hs, tr = H + dt, lr = H + ie, Vr = H + Oe, Qr = Yr + "Exp", Jr = ms + "List", Zr = xs + Gs, Il = hi + "ng", br = hi + Pi + Qs, ef = hi + Pi + Wt, tf = et + "Comment", lf = et + "Element", Ql = Ms + ut, sf = Ms + qs + "ies", Zt = "de" + st, Ji = U + ut, ir = ct + "s", rf = "ends" + $i, ml = "func" + Pi, ff = ot + yi, af = ot + ut + "Value", nf = ot + ut + "Priority", Zi = Fs + "ers", ae = gl + Bs, X = "in" + Xs, cf = ll + "AdjacentHTML", Jl = Mt + "s", sr = Mt + "Token", Zl = sr + "s", rr = "of " + bs, be = wi + Bs, fr = "Own" + ut, Ef = ft + Gs, Ul = "path" + zs, of = Ws + "Default", ar = "proto" + bs, uf = We + yi, Tf = We + vs, pf = We + ut, Ci = Vs + $i, bi = tt + "Rule", Fl = V + "ionStart", yf = "set" + yi, hf = "set" + ut, Rf = Qs + "s" + $i, Sf = Ni + "Area", Fe = "tar" + ot, Ot = Oe + "area", lt = Oe + ks, Af = "async" + ml, nr = ot + fr + "Descriptor", Of = nr + "s", _f = "has" + fr, cr = (e, t, l, i) => `the ${e} ${t} ${Ii} ${l}, ` + Er(i), Er = (e) => `but got ${e} instead.`, L = (e, ...t) => e.push(...t), Di = (e, t) => e.sort(t), re = (e, t) => e.join(t), $ = (e, t) => e.forEach(t), Q = (e, t, l) => e.map(t, l), Nt = (e, t, l) => e.filter(t, l), or = (e, t, l) => e.find(t, l), ur = (e, t, l) => e.every(t, l), wf = (e, t, l) => e.indexOf(t, l), Tr = (e, t) => t[1] - e[1], Ge = (e) => Array.from(e), es = (e, t = 0) => Q(Ge({ [Wl]: e }), (l, i) => t + i), W = (e) => e.trim(), me = (e) => e.toLowerCase(), q = (e, t, l) => e.split(t, l), xl = (e, t) => e.match(t), If = (e) => e.toUpperCase(), Nf = (e) => If(e[0]) + fe(e, 1), Pf = (e) => me(e[0]) + fe(e, 1), Be = (e, t, l) => e[Rf](t, l), ts = (e, t, l) => e[rf](t, l), Re = (e, t) => t.test(e), ee = (e, t, l) => e[Vs](t, l), bl = (e, t, l) => {
  for (; Re(e, t); )
    e = ee(e, t, l);
  return e;
}, $f = (e) => Re(e, /^\d+$/), Cf = (e) => Re(e, /^(\w|\s|\.|\$|`|'|"|(\[(.|\s)+?\]))*;?$/g) && !Be(e, U + " "), pr = (e) => Re(W(e), /^((async\s+)?function\s*\([^)]*\)\s*{[^}]*}|(async\s*)?(?:\([^()]*\)|[$\w]+)\s*=>)/), Df = (e) => Pf(re(Q(q(e, "-"), Nf), "")), yr = (e) => JSON.stringify(e), di = (e, t) => {
  try {
    e = JSON.parse(e, t);
  } catch {
  }
  return e;
}, gi = (e) => "`" + ee(e, /`/g, "\\`") + "`", Ie = (...e) => re(e, " "), gt = (e) => me(fe(De[ar][Wr].call(e), 8, -1)), Tt = (e, t) => gt(e) === t, ne = (e) => e === rt, at = (e) => e === he, Ce = (e) => Tt(e, il), Y = (e) => Tt(e, Dt), sl = (e) => df(e) || gf(e), df = (e) => Tt(e, ml), gf = (e) => Tt(e, Af), se = (e) => Tt(e, Qe), Nl = (e) => Tt(e, oe) && isFinite(e), mf = (e) => Tt(e, ul), xf = (e) => Ht(e, hr), Ht = (e, t) => e instanceof t, mt = (e) => Ht(e, Node), kf = (e) => Ht(e, Text), Ke = (e) => Ht(e, HTMLElement), ei = (e) => Ht(e, Map), ti = (e) => Ht(e, Set), Le = window, De = Object, Ft = Reflect, pl = location, vt = Le[Si], Lf = Symbol, hr = RegExp, te = (e, t) => De[ar][_f].call(e, t), Te = (e, t, l) => {
  let i = l;
  try {
    i = t in e ? e[t] : l;
  } catch {
  }
  return i;
}, Xe = (e, t) => delete e[t], Mf = [
  ["w", "writable"],
  ["e", "enumerable"],
  ["c", "configurable"]
], J = (e, t, l = he, i = {}) => {
  let r = "";
  se(i) && (r = i, i = {}), $(Mf, ([c, n]) => {
    te(i, c) ? i[n] = i[c] : te(i, n) || (i[n] = !v(r, c));
  }), i[D] = l, De[Ql](e, t, i);
}, qt = (e) => g(pe(e)), pe = (e) => De.keys(e), Hf = (e = rt) => De[et](e), vf = (e, t = {}) => {
  const l = Hf(e);
  return De[sf](
    l,
    De[Of](t)
  ), l;
}, Uf = (e, t, l = De) => l[nr](e, t), Ff = (e) => De.getPrototypeOf(e), mi = (e, t = {}) => {
  $(pe(e), (l) => {
    J(e, l, e[l], t);
  });
}, xi = (e) => $(pe(e), (t) => {
  Xe(e, t);
}), Se = (e = he) => new Map(e), je = (e = he) => new Set(e), Rr = (e, t) => new hr(e, t), Xt = (e, t) => {
  if (e === t) return e;
  if (Y(e) && Y(t)) {
    for (; g(e) > g(t); ) e.pop();
    for (let l = 0; l < g(t); l++)
      l < g(e) ? e[l] = Xt(e[l], t[l]) : e.push(ve(t[l]));
  } else if (ei(e) && ei(t)) {
    let l = Se(e);
    e.clear();
    for (let [i, r] of pt(t))
      e.set(i, l.has(i) ? Xt(l.get(i), r) : ve(r));
  } else if (ti(e) && ti(t)) {
    e.clear();
    for (let l of t)
      e.add(l);
  } else if (Ce(e) && Ce(t)) {
    let l = { ...e };
    xi(e);
    for (let i in t)
      te(t, i) && (e[i] = te(l, i) ? Xt(l[i], t[i]) : ve(t[i]));
  } else
    return t;
  return e;
}, ve = (e) => {
  let t = e;
  if (Ce(e)) {
    let l = {};
    for (let i in e)
      te(e, i) && (l[i] = ve(e[i]));
    t = l;
  }
  return Y(e) && (t = Q(e, ve)), ei(e) && (t = Se(Q(Ge(pt(e)), ([l, i]) => [l, ve(i)]))), ti(e) && (t = je(Q(Ge(e), ve))), t;
}, v = (e, t, l) => e.includes(t, l), pt = (e) => Ce(e) ? De[Yi](e) : e[Yi](), fe = (e, t, l) => e.slice(t, l), g = (e) => at(e[Wl]) ? e.size : e[Wl], xe = (e, t = 0) => setTimeout(e, t), Bf = (e) => {
  clearTimeout(e);
}, Pl = (e, t) => {
  let l;
  return (...i) => {
    Bf(l), l = xe(() => e(...i), t);
  };
}, Yf = (e, t) => {
  let l = 0;
  return (...i) => {
    let r = Date.now();
    if (!(r - l < t))
      return l = r, e(...i);
  };
}, ls = {}, is = (e) => fe(ee(crypto.randomUUID(), /-/g, ""), 0, e - 1), rl = (e = 8) => {
  let t = is(e);
  for (; t in ls; ) t = is(g(t) + 1);
  return ls[t] = !0, "b" + t;
}, Sr = (e, ...t) => console[e]("Brio.js", ...t), kl = (...e) => Sr("warn", `warn:
`, ...e), z = (...e) => Sr(zi, `detected an ${zi}:
`, ...e), xt = (e, t = vt) => Ge(t.querySelectorAll(e)), j = (e, t = vt) => se(e) ? xt(e, t)[0] : e, nt = (e, t, ...l) => e[t](...l), zf = (e, t, l) => {
  t == ae || t == be ? e[t] = l : e[cf](t, l);
}, li = (e) => e[Zr](!0), Ar = (e, t) => $(Ge(e.attributes), ({ name: l, [D]: i }) => t(l, i)), Pt = (e) => e[We](), bt = (e) => e[Ef], Or = (e) => W(e[lt] || ""), Je = (e) => [...e.childNodes], K = (e, t) => e[ff](t), ki = (e, t, l, i) => {
  i && (e[i] = l), e[yf](t, l);
}, fl = (e, t) => e[uf](t), Gf = (e, ...t) => e[Jr].add(...t), ss = requestAnimationFrame, Bl = (e) => ss(() => ss(e)), _r = (e, t) => vt[lf](e, t), wr = (e) => vt[tf](e), Kf = (e) => new DOMParser().parseFromString(e, Oe + "/" + dt), $e = (e) => me(e.tagName || ""), Pe = (e, t, l, i) => (se(e) && (e = j(e)), e[qr](t, l, i), () => e[Tf](t, l)), it = (e, t, l) => j(e).dispatchEvent(new CustomEvent(me(ee(t, /[^a-z\d]/gi, "")), {
  bubbles: !0,
  cancelable: !0,
  [Ls]: l
})), ii = async (e, t) => {
  if (await t(e))
    for (let l of Je(e))
      await ii(l, t);
}, jf = (e) => e[Fe][Il] = !0, Wf = (e) => {
  let t = e[Fe];
  t[Il] && (t[Il] = !1, it(t, X));
}, Ir = (e) => Le.getComputedStyle(e), qf = (e) => {
  let t = Ir(e);
  return !(!bt(e) || t[Al] == "none" || t.visibility == "hidden" || t.opacity == "0");
}, Xf = (e, t) => new URL(e, t), yl = (e = "", t = Ki) => Xf(e, pl[Ki])[t], Nr = (e) => v([D, At, V + "ed"], e), Vf = (e) => ee(ee(e, /[^a-z0-9_-]/gi, ""), /^[^a-z_]+/i, ""), Pr = (e) => {
  let t = {};
  for (let l of e)
    t[l] = [e[af](l), e[nf](l)];
  return t;
}, rs = (e) => {
  let t = {}, l = {};
  for (let i in e)
    (Be(i, wt) ? t : l)[i] = e[i];
  return [t, l];
}, fs = (e) => {
  for (let t of document.styleSheets)
    try {
      for (let l of t.cssRules)
        if (l.selectorText == e)
          return Pr(l[G]);
    } catch {
    }
}, Qf = (e, t, l, i) => {
  e[G][hf](t, l, i);
}, Jf = (e, t) => {
  e[G][pf](t);
}, Ee = (e, ...t) => {
  for (let l of t)
    for (let i in l)
      Qf(e, i, ...l[i]);
}, we = (e, ...t) => {
  for (let l of t)
    for (let i in l)
      Jf(e, i);
}, Zf = (e, t, l) => async (i, r, c, n) => {
  let a = r == wi ? be : r == gl ? ae : r == Oe ? lt : r == Ze ? Ze + vl : r == "first" ? Me + vl : r == "last" ? Ze + Wt : r == Me ? Me + Wt : r, f = "$dom." + ll, s = j(c), E = j(Fs), o = j(Br);
  if (!s) return z(f, Ye, _l);
  (E == s || o == s) && (a = ae);
  let u = j(dt) == s, O = a == lt, R = O || a == ae, h = a == be, p = R ? s : bt(s);
  if (!p && !u) return z(f, ft, Ye, _l);
  i = await i, i in l && (i = l[i]());
  let C = mt(i) ? i : Kf(i), I = Te(n, V);
  I && (i = j(I, C)), mt(i) && (i = i[be]), (h || u) && t(s, !1), R && $(Je(s), (S) => t(S));
  let M = je(Je(s));
  p && $(Je(p), (S) => M.add(S));
  let F = (S) => Nt(Je(S), (B) => !M.has(B)), x = [];
  u ? (s[ae] = j(dt, C)[ae], x = [s, ...xt(b, s)]) : R ? (s[O ? lt : ae] = i, x = Je(s)) : h ? (s[be] = i, x = F(p)) : (zf(s, a, i), x = F(a == Ze + vl || a == Me + Wt ? p : s)), Di(x, (S, B) => {
    let _ = $e(S) == G, P = $e(B) == G;
    return _ && !P ? -1 : P && !_ ? 1 : 0;
  }), $(x, (S) => {
    if (
      // is script element
      $e(S) == b && // is not b-script
      ne(K(S, H + b)) && // should load: !(b-load-once attribute AND script already loaded)
      !(!ne(K(S, "b-load-" + js)) && Lr.has(K(S, "src")))
    ) {
      let B = _r(b);
      Ar(S, (_, P) => ki(B, _, P, Nr(_) && _)), B[ae] = S[ae], nt(S, Ci, B);
    }
  }), Te(n, st, !0) && $(x, (S) => e(S, s));
  let le = Te(n, "then");
  le && await le(x);
}, Yl = (e, t = "", l = "") => {
  let i = t == Lt ? FormData : URLSearchParams, r = new i(), c = (n, a = "") => {
    Ce(n) || Y(n) ? $(pt(n), ([f, s]) => {
      let E = a ? `${a}[${f}]` : f;
      c(s, E);
    }) : r[$s](a, n);
  };
  return c(e, l), r;
}, Bt = (e) => async (t, l, i = {}) => {
  let r = "status", c = ks + "-Type", n = Te(i, "parser");
  if (Ce(l)) {
    let a = i[Zi] || {}, f = or(pe(a), (E) => me(E) == me(c)), s = me(a[f] || "");
    Xe(a, f), e == ot || e == U ? (t += Yl(l), l = he) : ts(s, "json") ? (l = yr(l), a[c] = "application/json") : ts(s, "form-data") ? l = Yl(l, Lt) : l = Yl(l), i[Zi] = a;
  }
  try {
    let a = await fetch(t, { ...i, [zr]: e, body: l }), f = await a[n || Oe]();
    if (!n)
      try {
        f = di(f);
      } catch {
      }
    if (!a.ok) {
      let s = new Error(`HTTP ${a[r]}! Status text: ` + a.statusText);
      throw s.response = a, s[Ri] = f, s;
    }
    return f;
  } catch (a) {
    throw a;
  }
}, $l = {
  get: Bt(ot),
  post: Bt(Kr),
  put: Bt(Xs),
  [Xi]: Bt(Xi),
  [U]: Bt(U)
}, bf = (e, t, l) => [
  // Set a route
  (i, r) => {
    if (sl(r)) {
      i = yl(i, Ul);
      let c = Nt(q(i, "/"), W), n = g(c) - 1, a = e;
      $(c, (f, s) => {
        f in a || (a[f] = {}), a = a[f], s == n && (a[jt] = r);
      });
    } else z(gs, "set route without a", tt, ml, He, i);
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
    if (!Be(yl(i), pl.origin))
      return pl.href = i, rt;
    i = yl(i, Ul);
    let r = Nt(q(i, "/"), W), c = e, n = {}, a = 0;
    for (let f of r) {
      if (a = 0, f in c && !Be(f, ":"))
        c = c[f], a = 1;
      else for (let s of pe(c))
        if (Be(s, ":")) {
          let [E, o] = Nt(q(s, ":"), W);
          if (!o || o && o in t && t[o](f)) {
            let u = n[E];
            u ? Y(u) ? L(u, f) : n[E] = [u, f] : n[E] = f, c = c[s], a = 1;
            break;
          }
        }
      if (!a) break;
    }
    return a = a && c[jt] ? 1 : 0, a ? c[jt]({
      params: n,
      path: i,
      [We]: () => Xe(c, jt)
    }) : l($l.get(i), wi, dt), i != pl[Ul] && history.pushState(rt, "", i), !!a;
  }
];
const $r = je([
  // ECMAScript reserved keywords
  "break",
  "case",
  "catch",
  ms,
  "const",
  "continue",
  "debugger",
  "default",
  U,
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
  Js,
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
console.log("reserved keywords:", Array.from($r).join(", "));
let si = /^[a-z_$][\w$]*$/i, ea = (e) => {
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
  for (let o of i) {
    let u;
    for (; (u = o.exec(e)) !== null; ) {
      let O = u[1];
      if (O) {
        let R = Q(q(O, ","), (h) => ee(W(h), /=.*$/, ""));
        for (let h of R)
          xl(h, si) && l.add(h);
      }
    }
  }
  let r = [], c = /(['"`])(?:\\[\s\S]|(?!\1)[^\\])*\1/g, n = /\$\{([\s\S]*?)\}/g, a;
  for (; (a = c.exec(e)) !== null; ) {
    let o = a[1], u = a[_t], O = u + g(a[0]);
    if (o === "`") {
      let R = a[0], h = a[_t], p = 0, C;
      for (; (C = n.exec(R)) !== null; ) {
        let I = C[_t] + 2, M = I + g(C[0]) - 3;
        I > p && L(r, [
          h + p,
          h + I
        ]), p = M;
      }
      p < g(R) && L(r, [
        h + p,
        h + g(R)
      ]);
    } else
      L(r, [u, O]);
  }
  let f = je(), s = /\b([a-z_$][\w$]*)\s*:/gi;
  for (; (a = s.exec(e)) !== null; )
    f.add(a[1]);
  let E = [];
  for (; (a = t.exec(e)) !== null; ) {
    let o = a[0], u = a[_t], O = e[u - 1];
    $r.has(o) || l.has(o) || O === "." || f.has(o) || r.some(([R, h]) => u >= R && u < h) || L(E, [
      o,
      u,
      // start index of the variable
      u + g(o)
      // end index of the variable
    ]);
  }
  return E;
}, Cr = (e, t) => {
  let l = ea(t), i = "", r = 0, c = e.ctx;
  for (let [n, a, f] of l)
    if (!(n in c)) {
      for (let s of [Jt, "$uid", Xl, Vl, Ns, Ps])
        if (c[s] && n in c[s]) {
          i += fe(t, r, a) + `${s}.${n}`, r = f;
          break;
        }
    }
  return i + fe(t, r);
}, ta = (e) => Li(({ [ue]: t, prop: l }) => (tl(t)[qe].add(l), e)), ri = !1, fi = [], Dr = (e) => (fi = [], ri = !0, e({}), ri = !1, [...fi]), dr = (e) => {
  let t = Dr(e), l = g(t);
  if (l) {
    let [i, r] = t[l - 1];
    return (c) => at(c) ? i[r] : i[r] = c;
  }
}, Ae = (e, t) => {
  if (!as(e) || el(e)) return e;
  let l = Te(t, ft, rt);
  t = { [ft]: l };
  let i = {
    get(a, f) {
      return ri && (te(a, f) || !(f in a)) && L(fi, [r, f]), Ft.get(a, f, r);
    },
    set(a, f, s) {
      f in a || J(a, f);
      let E = r[f];
      if (E === s) return !0;
      let o = tl(r), u = {
        [Fe]: a,
        [ue]: r,
        prop: f,
        [Gt]: E
        // [NEW_VALUE]: newValue,
        // [OPERATION]: UNDEFINED,
      };
      mi(u, "wc"), Kt.has(s) && (Kt[U](s), s = s(u)), c.has(f) || (s = Ae(s)), u[It] = s, la(u);
      let O = Ft.set(a, f, s, r);
      return ns(o, u), O;
    },
    [Ji](a, f) {
      let s = a[f], E = Ft[Ji](a, f);
      return ns(tl(r), {
        [Fe]: a,
        [ue]: r,
        prop: f,
        [Gt]: s,
        [It]: he,
        [_i]: U
      }), E;
    },
    [Ql](a, f, s) {
      let E = s[D], o = r[f];
      return Kt.has(E) && (s[D] = E({ [ue]: r, prop: f, [It]: E, [Gt]: o })), !c.has(f) && D in s && (s[D] = Ae(s[D])), Ft[Ql](a, f, s);
    }
  };
  const r = new Proxy(el(l) ? vf(l, e) : e, i), c = je();
  let n = {
    // [PARENT]: parent,
    // [TARGET]: target,
    // proxied,
    [ue]: Se(),
    [Ne]: {},
    skip: c
    // refs: [],
    // [ON_SET]: {},
  };
  Ll.set(r, n);
  for (let a in e) {
    let f = e[a];
    Kt.has(f) && (f = f({
      [Fe]: e,
      [ue]: r,
      prop: a,
      [Gt]: he
    })), !c.has(a) && as(f) && Ft.set(e, a, f, r);
  }
  return r;
}, as = (e) => Y(e) || Ce(e), ns = (e, t) => {
  let l = Se(), i = e[Ne][t.prop];
  i && $(i, (c, n) => l.set(n, c)), $(e[ue], (c, n) => l.set(n, c));
  let r = Ge(l);
  Di(r, Tr);
  for (let [c] of r) c(t);
}, la = (e) => {
  e[_i] = at(e[Gt]) ? et : at(e[It]) ? U : ql;
}, gr = "getItem", mr = "setItem", ai = Se(), ia = (e) => {
  let t = Ff(e);
  return t && te(t, gr) && te(t, mr);
}, ni = (e, t) => di(e[gr](t) || ""), cs = (e, t, l) => e[mr](t, yr(l)), Es = (e) => "_b_" + e, xr = (e, t, l) => ia(e) ? (l && (l = Es(l), te(e, l) && (t = ni(e, l))), Li(({ [ue]: r, prop: c }) => (ai.set(l, [r, c, e]), l = l || Es(c), te(e, l) ? t = ni(e, l) : cs(e, l, t), xe(() => Qt(r, c, () => {
  cs(e, l, r[c]);
})), t))) : z(Ol, Ni, il), sa = (e) => {
  if (ai.has(e.key)) {
    let [t, l, i] = ai.get(e.key);
    i === e[Sf] && (t[l] = ni(i, e.key));
  }
}, Vt = (e, t, l = 0) => {
  let i = [], r = Dr(t || e);
  return $(r, ([c, n]) => {
    L(i, kr(c, n, e, l));
  }), t && e({}), () => $(i, (c) => c());
}, Qt = (e, t, l, i = 0) => {
  let r;
  return el(e) ? /*hasProp(proxied, prop as string)*/ t || t === 0 ? r = kr(e, t, l, i) : r = ra(e, l, i) : (z(gs + `watch non-${ue} ${il}/${Dt}.`), r = () => {
  }), r;
}, Ll = Se(), Kt = je(), Li = (e) => Kt.add(e) && e, el = (e) => Ll.has(e), tl = (e) => Ll.get(e), ci = (e) => Ll[U](e), ra = (e, t, l = 0) => {
  if (el(e)) {
    let i = tl(e)[ue];
    return i.set(t, l), () => i[U](t);
  }
}, kr = (e, t, l, i = 0) => {
  let r = tl(e)[Ne];
  return r[t] || (r[t] = Se()), r[t].set(l, i), () => r[t][U](l);
};
J(Ae, "persist", (e, t) => xr(localStorage, e, t), "wc");
J(Ae, "session", (e, t) => xr(sessionStorage, e, t), "wc");
J(Ae, "init", Li, "wc");
J(Ae, qe, ta, "wc");
let Cl = (e, t, l = !0) => new Function(e, l ? `return(${t})` : t), fa = (e, t) => t ? gi(e) : $t(e), Ml = (e, t = "", l = !0) => (Cf(e) && !l && (e += `(${t})`), pr(e) || (e = fa(e, l == Oe), e = `(${t})=>` + (l ? `(${e})` : `{${e}}`)), e), os = (e, t, l) => {
  let i = e.get(t);
  return i && i[l];
}, aa = (e) => [
  // Adds a hook to a target
  (t, l, i, r = 0) => {
    sl(i) && (e.has(t) || e.set(t, {}), e.get(t)[l] || (e.get(t)[l] = Se()), os(e, t, l).set(i, r));
  },
  // Calls all the functions under a hook name on a target by priority
  async (t, l, i) => {
    let r = os(e, t, l);
    if (r && g(r)) {
      let c = Ge(r);
      Di(c, Tr);
      let n = -1, a = !0, f = async () => {
        if (n++, a = !0, n < g(c)) {
          let s = n;
          await c[s][0](
            /** Contextual data, if any */
            i,
            {
              /** Call the next function */
              play: f,
              /** Disable the auto-run feature and choose when/if to call the next function */
              [Gr]: () => a = !1,
              /** Remove the current function */
              [We]: () => r[U](c[s][0])
            }
          ), a && await f();
        }
      };
      await f();
    }
  }
], zl = "required", us = "matches", Ts = "\\p{L}", na = "\\p{Nd}", ca = Rr(bl(bl("^(?!.*\\.{2})[w._%+-]+@(?:[w](?:[w-]*[w])?\\.)+[l]{2,}$", /w/, Ts + na), /l/, Ts), "u"), Ea = (e) => {
  let t = {}, l = {};
  e || (e = {});
  let i = (s, E, o) => {
    let u = !1;
    return (se(s) || Y(s)) && (u = o ? g(s) >= E : g(s) <= E), Nl(s) && (u = o ? s >= E : s <= E), u;
  }, r = {
    [zl]: (s) => !!s || s === 0,
    min: (s, E) => i(s, E, !0),
    max: (s, E) => i(s, E, !1),
    [Tl]: (s) => se(s) && Re(s, ca),
    same: (s, E, o) => s === o[E],
    in: (s, E) => Y(E) && v(E, s),
    [us]: (s, E) => se(s) && Re(s, E),
    type: (s, E) => r.in(gt(s), Y(E) ? E : [E])
  }, c = {
    [zl]: (s) => Ie(s, "is", zl + "."),
    min: (s, E) => Ie(s, ke, "at least", E + "."),
    max: (s, E) => Ie(s, ke, "at most", E + "."),
    [Tl]: (s) => Ie(s, ke, Cs, Tl + "."),
    same: (s, E) => Ie(s, "must match", E + "."),
    in: (s, E) => Ie(s, ke, "equal to", re(E, " or ") + "."),
    [us]: (s) => s + " has an invalid format.",
    type: (s, E) => Ie(s, ke, rr, (Y(E) ? re(E, " or ") : E) + ".")
  }, n = (s, E) => {
    t[s] = E;
  }, a = (s, E, o) => {
    r[s] = E, o && (c[s] = o);
  }, f = () => {
    xi(l);
    for (let [s, E] of pt(t)) {
      let o = e[s];
      for (let u of E) {
        let O = "", R = "", h = "";
        se(u) ? O = u : Ce(u) && (O = u[zs], R = u[D], h = u[Ys]);
        let p = r[O];
        if (!p) {
          kl("Unknown rule: " + O);
          continue;
        }
        p(o, R, e) || (l[s] || (l[s] = []), h ? L(l[s], h) : L(l[s], c[O](s, R, e) || s + " is invalid."));
      }
    }
    return !qt(l);
  };
  return {
    prop: n,
    rule: a,
    [er]: f,
    errors: l
  };
}, jt = Lf(El), Mi = {}, Lr = je(), cn = () => {
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
        [ft]: N,
        // UID context
        uid: Te(N, "uid", {}),
        /** Attributes or directives */
        attr: {},
        /** Cleanup functions */
        cFns: [],
        ...d,
        ...Ut
      };
      for (let w in F) {
        let m = F[w](T, N);
        m && J(T.ctx, w, m, "c");
      }
      u.set(y, T), T[ce] = oa(T, H + ce)();
    }
    return T;
  }, i = (y, A, T, N) => {
    let w = y.el;
    x(w, A, N(w));
    let m = o(y, T);
    k(y, Vt(() => le(w, A, m)));
  }, r = (y, A) => {
    se(y) && (y = j(y)), se(A) && (A = j(A)), mt(A) || (A = he), mt(y) && (f(y), ii(y, async (T) => {
      let N = !1, w = y == T ? A : he;
      return kf(T) && Or(T) ? N = n(T, w) : Ke(T) && ($e(T) == b && ne(K(T, H + b)) ? N = !1 : N = await a(T, w)), N;
    }));
  }, c = (y, A = !0, T = !0) => {
    ii(y, (N) => {
      let w = e(N);
      return w && (w[de] && $(w[de], (m) => w[Zt](m, A, T)), w.ph && Pt(w.ph), $(w.cFns, (m) => m()), T && u[U](N), A && Pt(N)), !0;
    });
  }, n = (y, A) => {
    let T = y[lt], N = Mr($t(T || ""));
    if (N && Re(N, hl)) {
      let w = l(y, A), m = o(w, `$el.${lt}=` + gi(N), "", !1);
      k(w, Vt(m)), Ei(w, Oe, T);
    }
    return !1;
  }, a = async (y, A) => {
    let T = l(y, A);
    if (!at(Yt(T))) return !0;
    for (let [N, w] of R) {
      let m = [];
      if (xf(N))
        Ar(y, (_e, Ve) => {
          Re(_e, N) && L(m, [_e, Ve]);
        });
      else {
        let _e = K(y, N);
        ne(_e) || L(m, [N, _e]);
      }
      for (let [_e, Ve] of m) {
        if (Yt(T)) break;
        Ei(T, _e, Ve), await w(T, _e, $t(Ve));
      }
      if (Yt(T)) break;
    }
    return at(Yt(T)) && (T[qe] = !1), !qt(T[ye]) && !A && u[U](y), !Yt(T);
  }, f = (y) => {
    if (Ke(y)) {
      let A = xt(ie + `,[${zt}]`, y);
      (K(y, zt) || $e(y) == ie) && L(A, y), $(A, (T) => {
        let N = K(T, zt);
        fl(T, zt);
        let w = $e(T);
        if (w == ie && $(Je(T[Ri]), (m) => f(m)), N) {
          let m = w == b, _e = m ? b : w == G ? G : ie, Ve = T[w == ie ? be : ae];
          Ut[_e][N] = m ? Cl(yt, $t(Ve), !1) : Ve, ne(K(T, H + st)) && Pt(T);
        }
      });
    }
  }, s = (y) => (A, T) => {
    Ut[y][A] = T;
  }, E = (y, A, T = "", N = !0) => {
    let w;
    return A = Ml(A, T, N), A in M ? w = M[A] : (w = rl(), I[w] = Cl(yt, Cr(y, A)), M[A] = w), w;
  }, o = (y, A, T = "", N = !0) => {
    let w;
    try {
      let m = A in I ? A : E(y, A, T, N);
      w = I[m](y.ctx);
    } catch (m) {
      z(m[Ys]), w = () => jt;
    }
    return w;
  }, u = Se(), O = Se(), R = [], h = {}, p = {}, C = { [oe]: $f }, I = {}, M = {}, F = {
    // The element itself
    $el: (y) => y.el,
    // Unique identifier for the element
    $uid: (y) => y.uid,
    // Reactive properties defined in the element or inherited from the parent context
    [Vl]: ps(Vl, H + Ne, !0),
    // The $data context
    [Xl]: ps(Xl, ze),
    // Data Level Context:
    // Referenced under the same $data context, not including nested $data contexts
    $refs: ys("$refs"),
    $slots: ys("$slots"),
    // The $each context
    [Jt]: (y, A) => A == null ? void 0 : A.ctx[Jt],
    $cleanup: (y) => (A) => k(y, A)
  }, [x, le] = aa(O), S = Zf(r, c, h), [B, _] = bf(p, C, S);
  Mi[tt] || hs(_);
  let P = {
    hook: x,
    [tt]: B,
    router: hs,
    [bi]: s(bi + "s"),
    [ie]: s(ie),
    [G]: s(G),
    [b]: s(b),
    [Ne]: s(Ne),
    data: s(Lt),
    mask: s(Jl),
    [sr]: s(Zl)
  }, d = {
    [st]: r,
    [Zt]: c,
    [ll]: S,
    [tt]: _,
    emit: it,
    listen: Pe,
    query: j,
    queryAll: xt,
    /** Get the closest parent element of a target element that has a directive (b-data by default) */
    [Bi](y, A = ze) {
      let T = t(j(y), (N) => A in N[ye]);
      return T || z(Bi + ":", Ye, _l), T == null ? void 0 : T.el;
    },
    /** Get the local context of an element */
    context: (y) => {
      var A;
      return (A = e(j(y))) == null ? void 0 : A.ctx;
    }
  }, Z = {
    $dom: d,
    $http: $l,
    $set: P,
    [Ns]: Ae({}),
    $state: Ae,
    $watch: Qt,
    $effect: Vt,
    [Ps]: {
      hasProp: te,
      getProp: Te,
      setProp: J,
      sync: Xt,
      [xs]: ve,
      [er]: Ea
    }
  }, yt, Fi = () => yt = `{${re(pe(Z))},${re(pe(F))}}`;
  Fi();
  let Ut = {
    [ie]: h,
    [G]: {},
    [b]: {},
    [Ne]: {},
    data: {},
    // ! HYDRATION
    lcFns: F,
    [ir]: R,
    bnodes: u,
    hooks: O,
    [Jl]: {},
    [Zl]: {},
    routes: p,
    routeRules: C,
    // ! PUBLIC CONTEXT
    gc: Z,
    // ! TOOLS
    exec: o,
    [Qr]: E,
    [Ai]: Fi,
    [Et]: i,
    bnode: [l, e],
    hook: [x, le]
    // insert,
    // route: [SetRoute, Route],
  };
  return $([P, d, $l, Z, Ut], (y) => mi(y, "wc")), Ut;
}, Yt = (e) => e.skip, k = (e, t) => {
  L(e.cFns, t);
}, kt = (e, t) => {
  let l = e[ft];
  l && (l[de] || (l[de] = []), v(l[de], t) || L(l[de], t));
}, oa = (e, t, l = "{}") => {
  let i = Ke(e.el) ? K(e.el, t) : null;
  return ne(i) || Ei(e, t, i), i = $t(i || l), e.exec(e, i);
}, Ei = (e, t, l) => {
  e[ye][t] = l, Ke(e.el) && fl(e.el, t);
}, $t = (e) => ee(W(re(Q(q(e, He), (t) => Be(W(t), "//") ? "" : t), He)), /;$/, ""), hl = /\${((?!.*\${).*?)}/, ua = /{{((?!.*{{).*?)}}/, Mr = (e, t = "${$1}") => bl(e, ua, t), ps = (e, t, l) => (i, r) => {
  let c = i.el, n = r ? r.ctx[e] : rt, a = Ke(c), f = a && !ne(K(c, t)), s = a && (i[ye][ge] || !ne(K(c, ge))), E = a && (!n || f);
  return E && !f && t == ze && ki(c, ze, ""), E && !s ? Ae({}, { [ft]: l && n }) : n || {};
}, ys = (e) => (t, l) => !l || Ke(t.el) && !ne(K(t.el, ze)) ? {} : l.ctx[e], hs = (e) => {
  sl(e) && (Mi[tt] = () => e(yl()));
}, En = (e = {}) => {
  El in Le || (mi(e, "wc"), J(Le, El, e, "wc"), Pe(Le, Ni, sa), Pe(Le, "pop" + ue, Mi[tt]), it(Le, El));
}, Hl = (e, t) => fe(e, Be(e, H) ? t : t - 2), Ta = async (e, t) => {
  e[qe] = !0;
}, pa = [Ds, Ta], ya = (e, t, l) => {
  let i = e.el, [r, c] = e.bnode, [n, a] = e.hook;
  e[qe] = !0;
  let [f, s] = Q(q(l, " in "), W), [E, o] = Q(q(f, ","), W);
  o || (o = _t);
  let u = Ie("the", t, ct, Ii);
  if (!Re(E, si) || !Re(o, si))
    return z(u, Cs, "alias.");
  let O = e.exec(e, s), R = dr(O), h = R ? R() : O(), p = R && el(h), C = !1;
  if (Nl(h) && (h = Ae(es(h, 1)), C = !0, R && Vt(() => {
    let S = R();
    Nl(S) && Xt(h, es(S, 1));
  }, () => R())), !(Y(h) || Ce(h)))
    return z(u, `an ${Dt}, ${il}, or ${oe}.`);
  e.ph = wr(t), nt(i, Ci, e.ph), kt(e, i);
  let I = {}, M = t + "-" + et, F = t + "-" + ql, x = t + "-" + U;
  n(i, M, ([S, B]) => {
    let _ = li(i);
    nt(e.ph, Ze, _);
    let P = r(_, i);
    te(e[ye], ge) && (P[ye][ge] = "");
    let d = Ae({});
    J(d, E, B, "c"), J(d, o, S, "c"), J(P.ctx, Jt, d, "c"), k(P, () => {
      ci(d);
    }), k(P, Qt(d, o, ({ [It]: Z }) => {
      let yt = I[S][1];
      Z !== yt && (d[o] = yt);
    })), p && k(P, Qt(d, E, () => {
      h[d[o]] = d[E];
    })), I[S] = [_, S], e[st](_, i);
  }), n(i, F, ([S, B]) => {
    let _ = I[S], P = c(_ && _[0]);
    if (P) {
      let d = P.ctx[Jt];
      d[E] = B, d[o] = S, _[1] = S;
    }
  }), n(i, x, ([S, B]) => {
    let [_] = I[S];
    e[Zt](_), Xe(I, S);
  });
  let le = {
    [et]: (S) => a(i, M, S),
    [ql]: (S) => a(i, F, S),
    [U]: (S) => a(i, x, S)
  };
  for (let S of pt(h))
    le[et](S);
  R && k(e, Qt(h, he, ({ [_i]: S, prop: B, [It]: _ }) => {
    le[S]([B, _]);
  })), k(e, () => {
    for (let S in I)
      le[U]([Number(S), null]);
    C && ci(h);
  });
}, ha = [Xr, ya], Ra = async (e, t, l) => {
  let i = K(l, t);
  if (i) {
    let r = e.ctx.$refs;
    r[i] = l, fl(l, t), k(e, () => Xe(r, i));
  }
}, Sa = async (e, t, l) => {
  let i = K(l, t);
  if (i) {
    let r = e.ctx.$slots;
    fl(l, t), r[i] = l[be], Pt(l), k(e, () => Xe(r, i));
  }
}, Hr = async (e, t, l) => {
  let [i, r] = e.hook, c = t == ze, n = c ? Lt : Ne, a = e[n], f = l ? a[l] || Cl(e[Ai](), l) : () => ({}), s = e.ctx[Ct + n];
  i(e.el, t, async () => {
    let E = await f(e.ctx);
    if (!Ce(E))
      return e[qe] = !0, z(cr(ct, t, "an " + il, gt(E)));
    for (let o in E) J(s, o, E[o], Uf(E, o));
    c && await Hi(e), k(e, () => {
      xe(() => {
        ci(e.ctx[Ct + n]);
      });
    });
  }), await r(e.el, t, s);
}, Aa = [H + Ne, Hr], Oa = [ze, Hr], Gl = (e, t) => `:not([${t}]):not([${t}] [${e}])`, _a = (e) => {
  let t = Gl(e, ze) + Gl(e, zt) + Gl(e, Ds);
  return `[${e}]${t},${ie + t}`;
}, vr = (e, t) => {
  let l = [];
  return $(xt(e, t), (i) => {
    $e(i) == ie ? $(vr(e, i[Ri]), (r) => L(l, r)) : L(l, i);
  }), l;
}, Rs = async (e, t, l) => {
  let [i, r] = e.hook, c = e.el;
  i(c, t, () => {
    let n = [];
    $(e[de] || [c], (a) => {
      if (Ke(a)) {
        let f = vr(_a(t), a);
        L(n, a, ...f);
      }
    }), $(n, (a) => l(e, t, a));
  }), await r(c, t);
}, Hi = async (e) => {
  await Rs(e, "b-ref", Ra), await Rs(e, "b-slot", Sa);
}, Ss = {}, wa = async (e, t, l) => {
  if (l) {
    let i = e.el, [r, c] = e.hook;
    r(i, t, () => {
      let n = e.exec(e, l)();
      if (!Y(n) || !ur(n, se))
        return z("the", t, ct, ke, `an ${Dt} of ${Qe}(s).`);
      e.uid = n.reduce((a, f) => {
        let s = rl(5);
        return Ss[s] = !0, J(a, f, s, "wc"), a;
      }, {}), k(e, () => {
        for (let a in e.uid) Xe(Ss, e.uid[a]);
      });
    }), await c(i, t);
  }
}, Ia = ["b-uid", wa], Ur = (e) => (t, l, i) => {
  if (!t[ye][lr] && !t[ye][tr]) {
    let r = t[ie];
    i in r && (i = gi(r[i] || i)), i && t[Et](t, l, i, (c) => async (n) => {
      await t[ll](n(), e, c), e == gl && await Hi(t);
    });
  }
}, Na = [tr, Ur(gl)], Pa = [Vr, Ur(Oe)], $a = async (e, t, l) => {
  let i = e.el, r = l ? e[ie][l] || e.exec(e, l)() : i[ae];
  l || (i[ae] = "");
  let [c, n] = e.hook;
  c(i, t, async () => {
    se(r) ? (await e[ll](W(r), Ze, i, {
      then: (a) => {
        e[de] = a;
      }
    }), kt(e, i), Pt(i), await Hi(e)) : kl(t + ":", Ol, D, `
`, r);
  }), await n(i, t);
}, Ca = [lr, $a], Da = async (e, t, l) => {
  let i = e.el, r = e[b], c = $e(i) == b;
  e[qe] = c;
  let [n, a] = e.hook, f = l ? r[l] || e.exec(e, l)() : [];
  f = Q(
    Y(f) ? f : [f],
    (s) => r[s] || s
  ), kt(e, i), n(i, t, async () => {
    if (c) {
      let s = K(i, "src");
      s && Lr.add(s);
      let E = s ? await $l.get(s) : Or(i);
      E && L(f, $t(E)), Pt(i);
    }
    for (let s of f) {
      let E = s;
      if (se(E)) {
        let o = pr(E);
        E = Cl(e[Ai](), Cr(e, E), o), o && (E = E(e.ctx));
      }
      sl(E) && await E(e.ctx);
    }
  }), await a(i, t);
}, da = [H + b, Da], ga = (e, t, l) => {
  let i = e.el;
  if (l && $e(i) != G) {
    let [r, c] = e.hook, n = e[G], a = n[l] || e.exec(e, l)();
    a = Q(
      Y(a) ? a : [a],
      (s) => n[s] || s
    );
    let f = rl();
    r(i, t, () => {
      Gf(i, f);
      let s = _r(G);
      s[lt] = ma(re(a, He), "." + f), e[st](s, i), nt(i, Me, s), k(e, () => {
        e[Zt](s);
      });
    }), c(i, t, f);
  }
}, ma = (e, t) => {
  e = ee(e, /\/\*[\s\S]*?\*\//g, ""), e = Mr(e);
  let l = [], i = rl();
  for (; Re(e, hl); ) {
    let f = xl(e, hl);
    f && (L(l, f[0]), e = ee(e, hl, i));
  }
  let r = Nt(q(e, "}"), W), c = He + "    ", a = re(Q(r, (f) => {
    let [s, E] = q(f, "{"), o = Q(
      Q(q(s, ","), W),
      (u) => v(u, "&") ? ee(u, /&/g, t) : t + " " + u
    );
    return E = re(Q(Nt(q(E || "", He), W), W), c), re(o, ",") + ` {${c + E + He}}`;
  }), He);
  return $(l, (f) => {
    a = ee(a, i, f);
  }), a;
}, xa = [H + G, ga], ka = (e, t, l) => {
  let i, r;
  try {
    i = j(l), mt(i) && (l = Ml(l, "", Oe));
  } catch {
  }
  e[Et](e, t, l, (c) => (n) => {
    try {
      let a = n();
      Y(a) ? [i, r] = a : i = j(a);
    } catch {
    }
    v([Ze, Me, jr, $s], r) || (r = Me), mt(i) ? (nt(i, r, ...e[de] || [c]), kt(e, c)) : kl(Zs, Ye, _l, t + `="${l}"`);
  });
}, La = [H + Zs, ka], vi = rl(), Ma = (e, t, l) => {
  if (!(te(e[ye], ge) ? ge : te(e[ye], ol) ? ol : ""))
    return z("the", t, ct, ke, "used with", ge, "or", ol + ".");
  let r = e.exec(e, l)();
  if (Y(r) || g(r) == 2) {
    let c = va(e.el, ...r);
    e[ce][vi] = c, k(e, c[We]);
  }
}, Ha = [H + wt, Ma], va = (e, t, l) => {
  if (!Ke(e))
    return z(Ol, wt, Ye, e);
  let i = null, r = 1, c = 2, n = 3, a = 4, f = r, s = {
    [wt]: ["none", "important"]
  }, E = Pr(e[G]), o, u, O, R, h, p, C = () => {
    if (o = fs(t), R = fs(l), !o || !R)
      return z(Ol, wt, V + "ors:", `'${t}' and '${l}'`, ke, "valid CSS", V + "ors.");
    [u, O] = rs(o), [h, p] = rs(R);
  }, I, M = Pe(e, wt + Wt, (x) => {
    x[Fe] === e && (f == c ? (f = a, i && (we(e, o), Ee(e, E))) : f == n && (f = r, i || (we(e, R), Ee(e, E))), I && I());
  }), F = (x, le) => {
    I = le, !(x && i && f == a || !x && i === !1 && f == a) && (C(), x ? i === null || i && f == r || i === !1 && f == a ? (i = !0, f = c, we(e, R, u), Ee(e, O, s), Bl(() => {
      we(e, O, s), Ee(e, u);
    })) : !i && f == c ? (f = n, we(e, p), Ee(e, h)) : i && f == n && (f = c, we(e, O), Ee(e, u)) : (i === null && (i = !1, f = a, we(e, o, h), Ee(e, p, s), Bl(() => {
      we(e, s);
    })), !i && f == r || i && f == a ? (i = !1, f = c, we(e, o), Ee(e, s), Bl(() => {
      we(e, s), Ee(e, R);
    })) : i && f == c ? (f = n, Ee(e, o)) : !i && f == n && (f = c, Ee(e, R))));
  };
  return J(F, We, M), F;
}, Ua = (e, t, l) => {
  let i = e.el, r = li(i);
  e.ph = wr(t), nt(i, Ci, e.ph), e[qe] = !0, kt(e, i);
  let [c] = e.bnode, n, a, f = () => {
    e[Zt](n.el), n = he;
  };
  e[Et](e, t, l, () => (s) => {
    let E = s();
    xe(() => {
      if (E) {
        if (!n) {
          let o = li(r);
          nt(e.ph, Me, o), n = c(o, i), n[ye][ge] = "", e[st](o, i), kt(e, o);
        }
        a = n[ce][vi], a && a(!0);
      } else !E && n && (a ? a(!1, f) : f());
    });
  });
}, Fa = [ge, Ua], Ba = (e, t, l) => {
  let i = Ir(e.el)[Al];
  i == "none" && (i = "block"), e[Et](e, t, l, (r) => (c) => {
    let n = c();
    bt(r) && xe(() => {
      let a = e[ce][vi];
      n ? (r[G][Al] = i, a && a(!0)) : a ? a(!1, () => As(r)) : As(r);
    });
  });
}, Ya = [ol, Ba], As = (e) => {
  e[G][Al] = "none";
}, al = (e, t, l) => {
  let [i, r] = e.hook, c = Hl(t, 5), [n] = q(c, "-"), a = e[ce][t] || {}, f = e.el, s = e.exec(e, l, "$entry", !1);
  i(f, t, Pl(s, a[Sl] || 100));
  let E = new IntersectionObserver((o) => {
    $(o, async (u) => {
      u.isIntersecting != (n == Us) && (await r(f, t, u), a[js] && E[jl]());
    });
  }, a);
  E[Ks](f), k(e, () => E[jl]());
}, za = [
  [ji, al],
  [H + ji, al],
  [Wi, al],
  [H + Wi, al]
], Os = (e, t, l) => {
  let [i, r] = e.hook, c = Hl(t, 5);
  q(c, "-");
  let n = e.el, a = e[ce][t] || {}, f = a[Si] ? j(dt) : n, s = e.exec(e, l, "$size", !1);
  i(n, t, Pl(s, a[Sl] || 100));
  let E = new ResizeObserver((o) => {
    let u = o[0].borderBoxSize[0];
    r(n, t, [u.inlineSize, u.blockSize]);
  });
  E[Ks](f, a), k(e, () => E[jl]());
}, Ga = [
  [qi, Os],
  [H + qi, Os]
], Rt = "keyup", St = "keydown", _s = "outside", Ka = "window", Fr = "control", oi = "meta", nl = "arrow", ws = [
  oi,
  Fr,
  "shift",
  "alt",
  "fn"
], ja = {
  ctrl: Fr,
  cmd: oi,
  [Js]: oi,
  esc: "escape",
  del: U,
  up: nl + "up",
  down: nl + "down",
  left: nl + "left",
  right: nl + "right"
}, Wa = (e, t, l) => {
  let [i, r] = e.hook, c = Hl(t, 5), [n, ...a] = q(c, "-"), f = e.el, s = f, E = (p) => {
    let C = e.exec(e, l, Ct + Gi, !1);
    sl(C) ? C(p) : z(cr(Gi, t, "a " + ml, gt(C())));
  }, o = e[ce][t] || {};
  $(a, (p) => {
    o[p] = !0;
  }), Sl in o && (E = Pl(E, o[Sl])), Qi in o && (E = Yf(E, o[Qi])), i(f, t, E), o[_s] || o[Si] ? s = vt : o[Ka] && (s = Le);
  let u = {};
  v([St, Rt], n) && $(Te(o, "keys", []), (p) => {
    u[ja[p] || p] = !0;
  });
  let O = qt(u), R = n;
  if (v([St, Rt], n) && O) {
    let p = {};
    n = t;
    let C = Pl((I) => {
      it(s, n, I);
    }, 600);
    k(e, Pe(s, St, (I) => {
      let M = me(I.key);
      p[M] || (p[M] = !0), xe(() => {
        p.meta && !v(ws, M) && Kl(I, p);
      });
      let F = pe(p);
      O > 1 && Rt == R && p.meta && !v(ws, M) ? C(F) : St == R && it(s, n, F);
    })), k(e, Pe(s, Rt, (I) => {
      St == R && Kl(I, p), it(s, n, pe(p)), Rt == R && Kl(I, p);
    })), k(e, Pe(s, "focus", () => {
      xi(p);
    }));
  }
  k(e, Pe(s, n, (p) => {
    if (o[Ws] && p[of](), o.stop && p.stopPropagation(), !(o.self && p[Fe] !== p.currentTarget) && !(o[_s] && (f.contains(p[Fe]) || !qf(f)))) {
      if (v([St, Rt], R)) {
        let C = p[Ls];
        if (!(qt(u) == qt(C) && ur(pe(u), (I) => v(C, I))))
          return;
      }
      r(f, t, p);
    }
  }, o));
}, Kl = (e, t) => Xe(t, me(e.key)), qa = [/^(b-on-|on-)[\w-]+$/, Wa], Xa = (e, t, l) => {
  let i = Hl(t, 7);
  l = Ml(l || Df(i), "$initial"), i = Vf(i);
  let r = K(e.el, i), c = e[ce][t] || {};
  e[Et](e, t, l, (n) => (a) => {
    let f = a(r || ""), s = c.prop || Nr(i) && i;
    f || s ? ki(n, i, !s && f === !0 ? "" : f, s) : fl(n, i);
  });
}, Va = [/^(b-bind-|bind-)[\w-$]+$/, Xa], cl = Se(), Qa = (e, t, l) => {
  let [i, r] = e.hook, c = Ie("the", t, ct), n = Ie(Ii, "a reactive", D), a = V + "ed", f = e.el, s = $e(f), E = f.type;
  if (!v([X, Ot, V], s))
    return z(c, ds, X, `, ${Ot}, and ${V} ${Ye}s.`, f);
  let o = dr(e.exec(e, l));
  if (!o) {
    z(c, n, f);
    return;
  }
  let u = o(), O, R = () => Ge(s == V ? f[ce] : M()), h = e[ce][t] || {}, p = (_) => {
    let P = _[ne(K(_, D)) && I ? At : D], d = cl.get(_) || h;
    if (se(P) && (d.trim && (P = W(P)), !d.raw)) {
      let Z = di(P);
      (Nl(Z) || ne(Z) || mf(Z)) && (P = Z);
    }
    return P;
  }, C = (_) => s == X && v(_, E), I = C([ht, Vi]), M = () => xt(X + `[type="${ht}"][name="${f.name}"]`), F = () => C(ht) && g(M()) > 1, x = () => {
    let _ = [
      [X, ht, [oe, Qe, ul, Dt]],
      [X, Vi, [oe, Qe, ul]],
      [X, oe, [oe]],
      [X, "range", [oe]],
      [X, "", [oe, Qe]],
      [Ot, "", [oe, Qe]],
      [V, "", [oe, Qe, ul, Dt]]
    ];
    for (let [P, d, Z] of _)
      if (s == P && (!d || E == d)) {
        ne(u) || at(u) || v(Z, gt(u)) || kl(c, n, rr, re(Z, " or "), `for ${s == X ? E + " " : ""}${P} ${Ye}s,`, Er(gt(u)), f);
        break;
      }
  };
  xe(() => {
    x(), V == s ? $(R(), (_) => cl.set(_, h)) : C(ht) && cl.set(f, h);
  }, 1);
  let le = () => {
    if (u = o(), O = p(f), v([X, Ot], s))
      if (E == ht && Y(u))
        f[At] = v(u, O);
      else if (I)
        f[At] = u === O;
      else {
        if (f[Il] || vt.activeElement === f && u === O) return;
        u !== O && (f[D] = u);
      }
    else s == V && (Y(u) ? $(R(), (_) => {
      _[a] = v(u, p(_));
    }) : f[D] = u);
  };
  xe(() => k(e, Vt(le)), 5);
  let S = {};
  i(f, t, (_) => {
    if (u = o(), s == V && f.multiple || F()) {
      let P = [];
      $(R(), (d) => {
        s == V && cl.set(d, h), (d[a] || d[At]) && L(P, p(d));
      }), o(P);
    } else o(I && !f[At] ? !1 : p(f));
  }), (C([Oe, "search", "url", "tel", Tl, "password"]) || s == Ot) && (S[br] = jf, S[ef] = Wf);
  let B = h.lazy || I || s == V ? "change" : X;
  S[B] = () => r(f, t, o);
  for (let [_, P] of pt(S))
    k(e, Pe(f, _, P));
}, Ja = ["b-model", Qa], Za = (e) => {
  e["#"] = new RegExp("\\p{Nd}", "u"), e["&"] = /[\p{L}]/u, e["*"] = /[\p{L}\p{Nd}]/u;
}, Rl = "output", Ue = "cursor", Ui = "character", ui = "quantifier", Dl = "isToken", dl = "isOptional", Ti = "isMultiple", pi = "parts", ba = (e, t, l) => {
  let i = e.el, r = e[Jl], [c, n] = e.hook;
  if (!(D in i && Fl in i))
    return z("the", t, ct, ds, Ot, Ye + "s and textual", X, "types (text, email, etc.).");
  let a = r[l], f = e[ce][t] || {}, s = {
    ...f,
    [wl]: { ...e[Zl], ...f[wl] },
    mask: l,
    [D]: "",
    [Ue]: i[Fl],
    [pi]: [],
    [Rl]: ""
  };
  c(i, t, () => {
    s[D] = i[D], s[D] != s[Rl] && (s[pi] = [], s[Ue] = i[Fl], a && a(s), ln(s), i[D] = s[Rl], i.setSelectionRange(s[Ue], s[Ue]), it(i, Mt, s));
  }), xe(() => n(i, t), 7);
  let E = Pe(i, X, () => n(i, t), !0);
  k(e, E);
}, en = (e, t) => {
  let l = [], i = "\\";
  for (let r = 0; r < g(e); r++) {
    let c = e[r], n = {
      [Ui]: c,
      [ui]: 1,
      [Dl]: !1,
      [dl]: !1,
      [Ti]: !1
    };
    if (c != i || c == i && e[r + 1] == i) {
      if (v(pe(t), c) && (e[r - 1] != i || e[r - 2] == i)) {
        let a = xl(fe(e, r + 1), /^\d+/);
        if (a) {
          let s = a[0];
          r += g(s), n[ui] = +s;
        }
        n[Dl] = !0;
        let f = e[r + 1];
        (f == "?" || f == "+") && (n[dl] = f == "?", n[Ti] = f == "+", r++);
      }
      L(l, n);
    }
  }
  return l;
}, tn = (e, t) => or(fe(e, t + 1), (l) => !l[dl]), Is = (e, t, l) => {
  let i = -1;
  if (t) {
    let r = t[Ui];
    if (t[Dl]) {
      let c = xl(e, l[r]);
      c && (i = c[_t]);
    } else i = wf(e, r);
  }
  return i;
}, ln = (e) => {
  let t = e[wl], l = e[D], i = e[Ue], r = en(e[Mt], t), c = "", n = l, a = fe(l, i);
  for (let [f, s] of pt(r)) {
    let E = s[Ui], o = s[ui];
    if (s[Dl]) {
      if (o > 0) {
        if (!n) break;
        let u = "";
        for (; n && (o > 0 || s[Ti]); ) {
          let O = s[dl] || o < 1, R = Is(n, s, t), h = O && R > 0 && tn(r, +f), p = Is(n, h, t);
          if (R < 0 || p >= 0 && R > p) {
            O || (n = "");
            break;
          }
          R || (u += n[0], o--), n = fe(n, 1), a == n && (i = g(c + u));
        }
        c += u, s[D] = u;
      }
    } else n && (a == n && (i = g(c)), c += E, s[D] = E, n[0] == E && (n = fe(n, 1)));
  }
  e[Ue] = e[Ue] == 0 ? 0 : e[Ue] == g(e[D]) ? g(c) : i, e[Rl] = c, e[pi] = r;
}, sn = (e) => {
  let t = e[D], l = Te(e, "decimal", "."), i = Te(e, "thousands", ","), r = Te(e, "precision", 2);
  l == "," && (i = "."), i == "." && (l = ",");
  let c = q(t, l), n = c[0], a = Be(n, "-");
  n = ee(n, /\D/g, ""), n = n && (ee(n, /^0+/, "") || "0");
  let f = g(c) > 1, s = f ? re(fe(c, 1), l) : "", E = g(n), o = a ? "-" : "";
  for (let h = 0; h < E; h++)
    h > 0 && (E - h) % 3 == 0 && (o += i), o += "#";
  let u = e[wl];
  t = a ? "-" + n : n, r > 0 && (u[l] = Rr(`\\${l}`), f && (t += l + s), o += l + "#" + r), e[Mt] = o, a && (u["-"] = /-/), u["#"] = /\d/;
  let O = 0, R = "";
  for (let h of e[D])
    h == t[O] ? (R += h, O++) : R += "∅";
  e[D] = R;
}, rn = [H + Mt, ba], fn = (e, t, l) => {
  l = Ml(l, "$controls", !1), e[Et](e, t, l, () => async (i, r) => {
    await i(r);
  });
}, an = ["b-effect", fn], nn = [
  /**
   * The b-ignore directive is used to stop the hydration of the element and its children.
   */
  pa,
  /**
   * Conditional hydration
   * Notes:
   * - b-if stops the hydration flow of the element and starts a new hydration flow with a copy of the element whenever the condition evaluates to true
   * - the original element is replaced with a placeholder comment node to hold its location in the DOM
   * - whenever the condition evaluates to false, the copy of the element is dehydrated and removed from the DOM
   */
  Fa,
  /**
   * Context directives
   * Notes:
   * - the order of inference is: $each, $uid, $data, $props, $store, $tools
   */
  Aa,
  Oa,
  /** List rendering
   * Notes:
   * - b-each stops the hydration flow of the element and starts a new hydration flow for each item it creates
   */
  ha,
  /**
   * Unique ID generator
   */
  Ia,
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
  Ca,
  /**
   * Conditional display
   * Notes:
   * - the element is hydrated regardless of the condition
   * - the b-show directive toggles the `display` of the element based on the condition
   */
  Ya,
  /**
   * The b-teleport moves the element to a different location in the DOM.
   * Notes:
   * - b-teleport also works with the b-if and b-template directives
   */
  La,
  /**
   * Run one or more scripts on the element
   * Notes:
   * - the b-script directive may hold one script or an array of scripts
   * - the script(s) are executed in order and awaited
   * - when b-script is in a script element the content of the src file or text content is added to the list of scripts to be executed
   */
  da,
  /**
   * Dynamic hydration of HTML or text content and styles
   * Notes:
   * - if the element has a b-html and b-text directive, the b-html directive is hydrated and the b-text directive is ignored
   * - b-style always hydrates regardless of the b-html and b-text directives
   */
  Na,
  Pa,
  /**
   * Dynamic insertion of styles
   * Notes:
   * - the style element is inserted after the element that contains the b-style directive
   */
  xa,
  /**
   * Data binding directives
   * Used to bind data to an element's property or attribute
   * 
   * - The `b-bind-|bind-` directive is a general directive used to bind data to an element property or attribute
   * - The `b-model` directive is used to create a two-way data binding between an input value and a reactive property
   * - The `b-mask` directive is used to format an input value using a mask
   */
  Va,
  // [b-bind|bind]-[attributeName]
  Ja,
  rn,
  // ['b-boost', hydrateBoost],
  Ha,
  // b-transition, b-transition-play, b-transition-reverse
  ...za,
  // [b-on|on]-enter, [b-on|on]-exit
  ...Ga,
  // [b-on|on]-resize
  qa,
  // [b-on|on]-[eventName]
  /**
   * b-effect: used to create an effect that run when its dependencies change.
   * It is perfect for small expressions, reactive or not.
   * Example: console.log(`Hello, ${$data.name}!`)
   */
  an
], on = (e) => {
  $(nn, (t) => L(e[ir], t)), e.masks.money = sn, Za(e.maskTokens);
};
export {
  Va as bindDirective,
  Oa as dataDirective,
  ha as eachDirective,
  Na as htmlDirective,
  Fa as ifDirective,
  pa as ignoreDirective,
  za as intersectionDirectives,
  rn as maskDirective,
  Ja as modelDirective,
  sn as moneyMask,
  cn as newApp,
  qa as onDirective,
  Aa as propsDirective,
  Ga as resizeDirectives,
  da as scriptDirective,
  on as setAllDirectives,
  Za as setDefaultMaskTokens,
  Mi as settings,
  En as setup,
  Ya as showDirective,
  xa as styleDirective,
  La as teleportDirective,
  Ca as templateDirective,
  Ha as transitionDirective,
  Ia as uidDirective
};
//# sourceMappingURL=briojs.1.0.1.js.map
