let nl = "brio", wt = "$", We = "$for", Kl = "$ref", Vl = "$slot", oi = "$store", pt = "after", Tl = "append", ht = "array", Bs = "async", oe = "attr", wl = "Attribute", H = "b-", wr = "b-for", Ce = "b-if", Dr = "b-ignore", Ei = "b-ref", dr = "b-save", al = "b-show", Cr = "b-slot", qt = "before", ks = "body", cl = "boolean", gr = "can only be used on", Hs = "Cannot ", lt = "checkbox", rt = "checked", Ys = "Child", xr = "class", mr = "clone", ui = "composi", Ti = "content", Lr = "Content", Qt = "create", Jt = "data", Yt = "debounce", Gs = "detail", zs = "default", $r = "define", G = "delete", je = "directive", pl = "disconnect", Ws = "display", pi = "document", Fe = "element", ol = "email", Mr = "end", Mi = "entries", vi = "error", Ks = "event", vr = "EventListener", Fr = "exit", qe = "get", Ur = "has", Br = "head", hi = "html", Ri = "HTML", Dl = "hydrate", Vs = "index", Xs = "inner", js = "insert", Gt = "Invalid", kr = "length", Hr = "mask", Yr = "message", qs = "method", q = "must be", ne = `
`, at = "newValue", hl = "Node", ke = "nodes", Gr = "not found.", dl = null, ee = "number", Dt = "object", yi = "observe", vt = "oldValue", Qe = "on-", Fi = Qe + "enter", Ui = Qe + Fr, Bi = Qe + "resize", Qs = "once", Ni = "operation", ue = "options", Js = "outer", zt = "parent", ki = "patch", Zs = "post", Xl = "prepend", zr = "prevent", Wr = "Propert", Je = Wr + "y", Rt = "props", Kr = "put", Hi = "radio", Ze = "remove", Si = "replace", Vr = "require", ae = "script", Z = "skip", j = "select", Xr = "set", te = "state", jr = "start", Oi = "storage", de = "string", ie = "style", bs = "super", qr = "teleport", fe = "template", _e = "text", Yi = "throttle", _i = "tion", Qr = "toString", ct = "transition", Jr = "type", Q, Zr = "update", Ai = "valid", g = "value", Pi = "With", ef = "a " + Ai, tf = "add" + vr, Ke = wt + Jt, Zt = "$de" + Dl, bt = wt + Dl, Cl = wt + js, jl = wt + Rt, Ve = H + Jt, br = H + hi, Ii = H + ae, yt = H + fe, lf = H + _e, es = Ys + "ren", ts = xr + "List", rf = mr + hl, Rl = ui + "ng", sf = ui + _i + jr, ff = ui + _i + Mr, nf = Qt + "Comment", af = Qt + "Element", ql = $r + Je, cf = $r + Wr + "ies", ft = "de" + Dl + es, Gi = G + Je, ls = je + "s", of = "ends" + Pi, wi = "func" + _i, Ef = qe + wl, uf = qe + Je + "Value", Tf = qe + Je + "Priority", pf = Ur + wl, zi = Br + "ers", Bt = Xs + Ri, W = "in" + Kr, nt = "of " + Jr, is = Js + Ri, rs = "Own" + Je, hf = zt + hl, Rf = zr + "Default", ss = "proto" + Jr, yf = Ze + wl, Nf = Ze + vr, Sf = Ze + Je, kt = Si + Pi, Ft = Si + es, Di = Vr + "s", El = Vr + "d", Gl = j + "ionStart", Of = j + "or", _f = Xr + wl, Af = Xr + Je, Pf = jr + "s" + Pi, If = Oi + "Area", re = "tar" + qe, st = _e + "area", Nt = _e + Lr, wf = Ai + "ate", Df = Bs + wi, fs = qe + rs + "Descriptor", df = fs + "s", Cf = Ur + rs, gf = (e, t, l, i) => `the ${e} ${t} ${Di} ${l}, ` + gl(i), gl = (e) => `but got ${e} instead.`, Ql = Di + " a reactive " + g, D = (e, ...t) => e.push(...t), xf = (e, t) => e.sort(t), Te = (e, t) => e.join(t), C = (e, t) => e.forEach(t), Se = (e, t, l) => e.map(t, l), di = (e, t, l) => e.filter(t, l), ns = (e, t, l) => e.find(t, l), Wt = (e, t, l) => e.every(t, l), as = (e, t, l) => e.some(t, l), cs = (e, t, l) => e.indexOf(t, l), mf = (e, t) => t[1] - e[1], Xe = (e) => Array.from(e), Wi = (e, t = 0) => Se(Xe({ [kr]: e }), (l, i) => t + i), b = (e) => e.trim(), Ee = (e) => e.toLowerCase(), me = (e, t, l) => e.split(t, l), Lf = (e, t) => e.match(t), os = (e) => e.toUpperCase(), Re = (e) => os(e[0]) + Ie(e, 1), $f = (e) => Ee(e[0]) + Ie(e, 1), Es = (e, t, l) => e[Pf](t, l), Jl = (e, t, l) => e[of](t, l), V = (e, t) => t.test(e), ye = (e, t, l) => e[Si](t, l), Zl = (e, t, l) => {
  for (; V(e, t); )
    e = ye(e, t, l);
  return e;
}, Ci = (e) => V(b(e), /^((async\s+)?function\s*\([^)]*\)\s*{[^}]*}|(async\s*)?(?:\([^()]*\)|[$\w]+)\s*=>)/), Mf = (e) => $f(Te(Se(me(e, "-"), Re), "")), us = (e) => JSON.stringify(e), gi = (e, t) => {
  try {
    e = JSON.parse(e, t);
  } catch {
  }
  return e;
}, xl = (e) => "`" + e + "`", se = (...e) => Te(e, " "), ge = (e) => Ee(Ie(Pe[ss][Qr].call(e), 8, -1)), be = (e, t) => ge(e) === t, Kt = (e) => e === dl, yl = (e) => e === Q, z = (e) => be(e, Dt), $ = (e) => be(e, ht), Le = (e) => vf(e) || Ff(e), vf = (e) => be(e, wi), Ff = (e) => be(e, Df), M = (e) => be(e, de), Ae = (e) => be(e, ee) && !isNaN(e), Uf = (e) => be(e, cl), Ts = (e) => dt(e, ps), dt = (e, t) => e instanceof t, ot = (e) => dt(e, Node), Bf = (e) => dt(e, Text), $e = (e) => dt(e, HTMLElement), bl = (e) => dt(e, Map), ei = (e) => dt(e, Set), Ge = window, Pe = Object, mt = Reflect, kf = location, Ct = Ge[pi], Hf = Symbol, ps = RegExp, K = (e, t) => Pe[ss][Cf].call(e, t), xe = (e, t, l) => {
  let i = l;
  try {
    i = t in e ? e[t] : l;
  } catch {
  }
  return i;
}, gt = (e, t) => delete e[t], Yf = [
  ["w", "writable"],
  ["e", "enumerable"],
  ["c", "configurable"]
], J = (e, t, l = Q, i = "") => {
  if (M(i)) {
    let r = i;
    i = { [g]: l }, C(Yf, ([f, s]) => {
      i[s] = m(r, f);
    });
  }
  Pe[ql](e, t, i);
}, Et = (e) => I(et(e)), et = (e) => Pe.keys(e), Gf = (e = dl) => Pe[Qt](e), zf = (e, t = {}) => {
  const l = Gf(e);
  return Pe[cf](
    l,
    Pe[df](t)
  ), l;
}, Wf = (e, t, l = Pe) => l[fs](e, t), Kf = (e) => Pe.getPrototypeOf(e), xi = (e, t = {}) => {
  C(et(e), (l) => {
    J(e, l, e[l], t);
  });
}, hs = (e) => C(et(e), (t) => {
  gt(e, t);
}), pe = (e = Q) => new Map(e), mi = (e = Q) => new Set(e), Vf = (e, t) => new ps(e, t), ut = (e, t) => {
  if (e === t) return e;
  if ($(e) && $(t)) {
    for (; I(e) > I(t); ) e.pop();
    for (let l = 0; l < I(t); l++)
      l < I(e) ? e[l] = ut(e[l], t[l]) : e.push(ve(t[l]));
  } else if (bl(e) && bl(t)) {
    let l = pe(e);
    e.clear();
    for (let [i, r] of tt(t))
      e.set(i, l.has(i) ? ut(l.get(i), r) : ve(r));
  } else if (ei(e) && ei(t)) {
    e.clear();
    for (let l of t)
      e.add(l);
  } else if (z(e) && z(t)) {
    let l = { ...e };
    hs(e);
    for (let i in t)
      K(t, i) && (e[i] = K(l, i) ? ut(l[i], t[i]) : ve(t[i]));
  } else
    return t;
  return e;
}, ve = (e) => {
  let t = e;
  if (z(e)) {
    let l = {};
    for (let i in e)
      K(e, i) && (l[i] = ve(e[i]));
    t = l;
  }
  return $(e) && (t = Se(e, ve)), bl(e) && (t = pe(Se(Xe(tt(e)), ([l, i]) => [l, ve(i)]))), ei(e) && (t = mi(Se(Xe(e), ve))), t;
}, m = (e, t, l) => e.includes(t, l), tt = (e) => z(e) ? Pe[Mi](e) : e[Mi](), Ie = (e, t, l) => e.slice(t, l), I = (e) => e[kr], el = (e, t = 0) => setTimeout(e, t), Xf = (e) => {
  clearTimeout(e);
}, ml = (e, t) => {
  let l;
  return (...i) => {
    Xf(l), l = el(() => e(...i), t);
  };
}, jf = (e, t) => {
  let l = 0;
  return (...i) => {
    let r = Date.now();
    if (!(r - l < t))
      return l = r, e(...i);
  };
}, Ki = {}, Vi = (e) => Ie(ye("b" + [1e20], /[01]/g, () => crypto.getRandomValues(new Uint8Array(1))[0][Qr](36)), 0, e), Nl = (e = 8) => {
  let t = Vi(e);
  for (; t in Ki; ) t = Vi(I(t) + 1);
  return Ki[t] = !0, t;
}, Rs = (e, ...t) => console[e]("Brio.js", ...t), Ue = (...e) => Rs("warn", "warn:", ne, ...e), F = (...e) => Rs(vi, `detected an ${vi}:`, ne, ...e), Li = (e, t = Ct) => Xe(t.querySelectorAll(e)), ce = (e, t = Ct) => M(e) ? Li(e, t)[0] : e, we = (e, t, ...l) => e[t](...l), ys = (e) => e[rf](!0), Ns = (e, t) => C(Xe(e.attributes), ({ name: l, [g]: i }) => t(l, i)), St = (e) => e[Ze](), Sl = (e) => e[hf], Ss = (e) => b(e[Nt] || ""), ul = (e) => [...e.childNodes], Be = (e, t) => e[Ef](t), He = (e, t) => e[pf](t), Ll = (e, t, l, i) => {
  i && (e[i] = l), e[_f](t, l);
}, $l = (e, t) => e[yf](t), Os = (e, ...t) => e[ts].add(...t), qf = (e, ...t) => e[ts][Ze](...t), Xi = requestAnimationFrame, Ot = (e) => Xi(() => Xi(e)), ti = (e, t) => Ct[af](e, t), $i = (e) => Ct[nf](e), Ye = (e) => Ee(e.tagName || ""), Ne = (e, t, l, i) => (e = ce(e), e[tf](t, l, i), () => e[Nf](t, l)), Ml = (e, t, l) => ce(e).dispatchEvent(new CustomEvent(Ee(ye(t, /[^a-z\d]/gi, "")), {
  bubbles: !0,
  cancelable: !0,
  [Gs]: l
})), Ol = async (e, t, l = !1) => {
  if (await t(e))
    for (let i of ul(l && Ye(e) == fe ? e[Ti] : e))
      await Ol(i, t, l);
}, Qf = (e) => e[re][Rl] = !0, Jf = (e) => {
  let t = e[re];
  t[Rl] && (t[Rl] = !1, Ml(t, W));
}, Zf = (e) => Ge.getComputedStyle(e), bf = (e) => {
  let t = Zf(e);
  return !(!Sl(e) || t[Ws] == "none" || t.visibility == "hidden" || t.opacity == "0");
}, _s = (e) => m(["src", g, rt, j + "ed"], e), en = (e) => ye(ye(e, /[^\w-]/g, ""), /^[^a-z_]+/i, ""), tn = (e) => {
  let t = {};
  for (let l of e)
    t[l] = e[uf](l), e[Tf](l) == Al && (t[l] += " !" + Al);
  return t;
}, _l = (e) => {
  let t = {}, l = {};
  for (let i in e)
    (Es(i, ct) ? t : l)[i] = e[i];
  return [t, l];
}, Al = "important", ln = (e, t, l) => {
  let i = "";
  Jl(l + "", "!" + Al) && (l = b(Ie(l, 0, -10)), i = Al), e[ie][Af](t, l, i);
}, rn = (e, t) => {
  e[ie][Sf](t);
}, Vt = (e, ...t) => {
  for (let l of t)
    for (let i in l)
      ln(e, i, l[i]);
}, Pl = (e, ...t) => {
  for (let l of t)
    for (let i in l)
      rn(e, i);
}, ji = (e) => `only supports ${Te(Ie(e, 0, -1), ", ")}, and ${e[I(e) - 1]} insertions`, sn = (e) => async (t, l, i, r) => {
  let f = Cl + ":", s = l == _e ? Nt : l, c = [qt, pt, Xl, Tl, kt, Ft, _e], n = () => as(c, (v) => v == l);
  if (!n())
    return F(f, ji(c));
  let a = ce(t);
  if (!ot(a))
    return F(f, re, q, nt, hl);
  if (ce(hi) == a)
    return F(f, re, "cannot be the", Ri, Fe);
  if (c = [Ft, Xl, Tl], (ce(Br) == a || ce(ks) == a) && !n())
    return F(f, os(Ye(a)), Fe, ji(c));
  i = await i;
  let o = e[fe];
  i in o && (i = o[i]);
  let E = s == Nt, T = i, h = !1, w;
  if (!E && M(i) && (T = ti("div"), T[Bt] = b(i), w = T.children[0], h = !0), !E && !ot(T))
    return F(f, Ti, q, nt, hl, "or", de);
  let O = xe(r, Of);
  if (!E && O && M(O)) {
    if (T = ce(O, T), !ot(T))
      return F(f, Fe, Gr);
    Be(T, H + Rt) && (w = T);
  }
  let { n: d, g: Y } = e.bnode, U = Y(a);
  if (U && w && !E) {
    let v = !0, A = {}, B = {}, x = Be(w, H + Rt);
    x && (B = U.exec(U, x)() || {});
    for (let N in B) {
      let y = B[N], u = y, p = !1, R = !1, _, P;
      if (z(y) && (u = y.type, p = !!y[El], R = !!y.isText, _ = y[zs], P = y.warn), u && M(u) && (u = [u]), !($(u) && I(u) && Wt(u, (k) => M(k)))) {
        Ue(se(Gt, "type for prop", N + ":", q, nt, de, "or an array of strings."), a);
        continue;
      }
      u = Se(u, Ee);
      let S = Be(a, N);
      if (Kt(S)) {
        p && (F("Missing required prop: " + N + ".", a), v = !1);
        continue;
      }
      if ($l(a, N), R && (S = xl(S)), Ci(S) && (S = "()=>" + S), M(S) && (S = U.exec(U, S || "true")()), !m(u, ge(S)) && !yl(_) && (S = Le(_) && !m(u, wi) ? _() : _), m(u, ge(S)) || Ue(se(Gt, "prop type for", N + ":", q, nt, Te(u, " or ") + ",", gl(ge(S))), a), Le(P)) {
        let k = P(S, N);
        k && Ue(k, a);
      }
      A[N] = S;
    }
    v && Et(A) && (U.ctx[jl] = A);
  }
  let De = e.gc[Zt];
  if (s == kt) await De(a, !1);
  else if (E || s == Ft)
    for (let v of ul(a)) await De(v, !1);
  let X = h ? ul(T) : [T];
  if (we(a, E ? Ft : s, ...X), E && (X = ul(a)), C(X, (v) => {
    let A = [];
    Ye(v) == ae ? D(A, v) : $e(v) && D(A, ...Li(ae, v)), C(A, (B) => {
      if (Wt([Ii, Dr, dr, Cr], (x) => !He(B, x))) {
        let x = ti(ae);
        Ns(B, (N, y) => Ll(x, N, y, _s(N) && N)), x[Bt] = B[Bt], we(B, kt, x);
      }
    });
  }), xe(r, Dl, !0))
    for (let v of X) {
      if ($e(v)) {
        let A = d(v, a);
        await kl(A);
      }
      await e.gc[bt](v, a);
    }
  return X;
}, zl = (e, t = "", l = "") => {
  let i = t == Jt ? FormData : URLSearchParams, r = new i(), f = (s, c = "") => {
    z(s) || $(s) ? C(tt(s), ([n, a]) => {
      let o = c ? `${c}[${n}]` : n;
      f(a, o);
    }) : r[Tl](c, s);
  };
  return f(e, l), r;
}, Lt = (e) => async (t, l, i = {}) => {
  let r = "status", f = Lr + "-Type", s = xe(i, "parser");
  if (z(l)) {
    let c = i[zi] || {}, n = ns(et(c), (o) => Ee(o) == Ee(f)), a = Ee(c[n] || "");
    gt(c, n), e == qe || e == G ? (t += zl(l), l = Q) : Jl(a, "json") ? (l = us(l), c[f] = "application/json") : Jl(a, "form-data") ? l = zl(l, Jt) : l = zl(l), i[zi] = c;
  }
  try {
    let c = await fetch(t, { ...i, [qs]: e, body: l }), n = await c[s || _e]();
    if (!s)
      try {
        n = gi(n);
      } catch {
      }
    if (!c.ok) {
      let a = new Error(`HTTP ${c[r]}! Status text: ` + c.statusText);
      throw a.response = c, a[Ti] = n, a;
    }
    return n;
  } catch (c) {
    throw c;
  }
}, li = {
  get: Lt(qe),
  post: Lt(Zs),
  put: Lt(Kr),
  [ki]: Lt(ki),
  [G]: Lt(G)
}, fn = (e) => Fl(({ [te]: t, prop: l }) => (Xt(t)[Z].add(l), e)), ii = !1, ri = [], As = (e) => (ri = [], ii = !0, e({}), ii = !1, [...ri]), Ps = (e) => {
  let t = As(e), l = I(t), [i, r] = t[l - 1] || [];
  return [i, r];
}, Oe = (e, t) => {
  if (!qi(e) || At(e)) return e;
  let l = {
    get(s, c) {
      return ii && (K(s, c) || !(c in s)) && D(ri, [i, c]), mt.get(s, c, i);
    },
    set(s, c, n) {
      c in s || J(s, c, Q, "wce");
      let a = i[c];
      if (a === n) return !0;
      let o = Xt(i), E = {
        [re]: s,
        [te]: i,
        prop: c,
        [vt]: a
        // [NEW_VALUE]: newValue,
        // [OPERATION]: UNDEFINED,
      };
      xi(E, "e"), Ut.has(n) && (Ut[G](n), n = n(E));
      const T = $(n) && $(a) || z(n) && z(a);
      T && ut(a, n), !r.has(c) && !T && (n = Oe(n)), E[at] = T ? a : n, nn(E);
      let h = T ? !0 : mt.set(s, c, n, i);
      return Qi(o, E), h;
    },
    [Gi](s, c) {
      let n = s[c], a = mt[Gi](s, c);
      return Qi(Xt(i), {
        [re]: s,
        [te]: i,
        prop: c,
        [vt]: n,
        [at]: Q,
        [Ni]: G
      }), a;
    },
    [ql](s, c, n) {
      let a = n[g], o = i[c];
      return Ut.has(a) && (n[g] = a({ [te]: i, prop: c, [at]: a, [vt]: o })), !r.has(c) && g in n && (n[g] = Oe(n[g])), mt[ql](s, c, n);
    }
  };
  const i = new Proxy(At(t) ? zf(t, e) : e, l), r = mi();
  let f = {
    // [PARENT]: parent,
    // [TARGET]: target,
    // proxied,
    [te]: pe(),
    [Rt]: {},
    skip: r
    // refs: [],
    // [ON_SET]: {},
  };
  vl.set(i, f);
  for (let s in e) {
    let c = e[s];
    Ut.has(c) && (c = c({
      [re]: e,
      [te]: i,
      prop: s,
      [vt]: Q
    })), !r.has(s) && qi(c) && mt.set(e, s, c, i);
  }
  return i;
}, qi = (e) => $(e) || z(e), Qi = (e, t) => {
  let l = pe(), i = e[Rt][t.prop];
  i && C(i, (f, s) => l.set(s, f)), C(e[te], (f, s) => l.set(s, f));
  let r = Xe(l);
  xf(r, mf);
  for (let [f] of r) f(t);
}, nn = (e) => {
  e[Ni] = yl(e[vt]) ? Qt : yl(e[at]) ? G : Zr;
}, _t = (e, t, l = 0) => {
  let i = [], r = As(t || e);
  return C(r, ([f, s]) => {
    D(i, Cs(f, s, e, l));
  }), t && e({}), () => C(i, (f) => f());
}, Ht = (e, t, l, i = 0) => {
  let r;
  return At(e) ? M(t) || Ae(t) ? r = Cs(e, t, l, i) : r = ds(e, l, i) : (F(Hs + `watch non-${te} ${Dt}/${ht}.`), r = () => {
  }), r;
}, Is = "getItem", ws = "setItem", si = pe(), an = (e) => {
  let t = Kf(e);
  return t && K(t, Is) && K(t, ws);
}, fi = (e, t) => gi(e[Is](t) || ""), Ji = (e, t, l) => e[ws](t, us(l)), Zi = (e) => "_b_" + e, Ds = (e, t, l) => an(e) ? (l && (l = Zi(l), K(e, l) && (t = fi(e, l))), Fl(({ [te]: r, prop: f }) => (si.set(l, [r, f, e]), l = l || Zi(f), K(e, l) ? t = fi(e, l) : Ji(e, l, t), el(() => Ht(r, f, () => {
  Ji(e, l, r[f]);
})), t))) : F(Gt, Oi, Dt), cn = (e, t) => Ds(localStorage, e, t), on = (e, t) => Ds(sessionStorage, e, t), En = (e) => {
  if (si.has(e.key)) {
    let [t, l, i] = si.get(e.key);
    i === e[If] && (t[l] = fi(i, e.key));
  }
}, un = (e) => Fl(({ [te]: t, prop: l }) => (_t(() => t[l] = e(), e), e())), vl = pe(), Ut = mi(), Fl = (e) => Ut.add(e) && e, At = (e) => vl.has(e), Xt = (e) => vl.get(e), ni = (e) => vl[G](e), ds = (e, t, l = 0) => {
  if (At(e)) {
    let i = Xt(e)[te];
    return i.set(t, l), () => i[G](t);
  }
}, Cs = (e, t, l, i = 0) => {
  let r = Xt(e)[Rt];
  r[t] || (r[t] = pe()), r[t].set(l, i);
  let f = e[t], s;
  return At(f) && (s = ds(f, l, i)), () => {
    s && s(), r[t][G](l);
  };
};
J(Oe, "init", Fl, "e");
J(Oe, Z, fn, "e");
let gs = (e, t, l = !0) => new Function(e, l ? `return(${t})` : t), xs = (e, t = "", l = !0) => (Ci(e) || (e = Ul(e), e = `(${t})=>` + (l ? `(${e})` : `{${e}}`)), e), ms = (e, t) => {
  let l = Lf(t, /^\s*([a-z_$][\w$]*)/i);
  if (!l) return t;
  for (let i of [We, Ke, oi]) {
    let r = e.ctx[i];
    if (r && l[1] in r) {
      t = i + "." + t;
      break;
    }
  }
  return t;
}, tl = (e, t) => "{" + Te(di(et(e), (l) => m(t, l)), ",") + "}", bi = "matches", er = " characters long.", tr = "\\p{L}", Tn = "\\p{Nd}", pn = Vf(Zl(Zl("^(?!.*\\.{2})[w._%+-]+@(?:[w](?:[w-]*[w])?\\.)+[l]{2,}$", /w/, tr + Tn), /l/, tr), "u"), hn = (e, t, l, i) => {
  let r = {};
  e || (e = {});
  let f = (n, a, o) => {
    let E = !1;
    return (M(n) || $(n)) && (E = o ? I(n) >= a : I(n) <= a), Ae(n) && (E = o ? n >= a : n <= a), E;
  }, s = {
    [El]: (n) => !!n || n === 0,
    min: (n, a) => f(n, a, !0),
    max: (n, a) => f(n, a, !1),
    [ol]: (n) => M(n) && V(n, pn),
    same: (n, a, o) => n === o[a],
    in: (n, a) => $(a) && m(a, n),
    [bi]: (n, a) => M(n) && V(n, a),
    type: (n, a) => s.in(ge(n), $(a) ? a : [a]),
    // Note that custom rules can override default rules
    ...l || {}
  }, c = {
    // E.g. "Username is required.", "Age is required."
    [El]: (n) => se(Re(n), "is", El + "."),
    // E.g. "Username must be at least 3 characters long.", "Age must be at least 18."
    min: (n, a, o) => se(Re(n), q, "at least", a + (M(o[n]) ? er : ".")),
    // E.g. "Username must be at most 20 characters long.", "Age must be at most 65."
    max: (n, a, o) => se(Re(n), q, "at most", a + (M(o[n]) ? er : ".")),
    // E.g. "Email must be valid."
    [ol]: () => se(Re(ol), q, Ai + "."),
    // E.g. "ConfirmPassword must be the same as the password."
    same: (n, a) => se(Re(n), q, "the same as the", Re(a) + "."),
    // E.g. "Status must be equal to active or pending."
    in: (n, a) => se(Re(n), q, "equal to", Te(a, " or ") + "."),
    // E.g. "Username is invalid."
    [bi]: (n) => Re(n) + " is invalid.",
    // E.g. "Username must be of type string.", "Age must be of type number or string."
    type: (n, a) => se(Re(n), q, nt, ($(a) ? Te(a, " or ") : a) + "."),
    // Note that custom messages can override default messages
    ...i || {}
  };
  for (let [n, a] of tt(t || {})) {
    let o = e[n];
    for (let { name: E, [g]: T, [Yr]: h } of a) {
      let w = s[E];
      w ? w(o, T, e) || (r[n] || (r[n] = []), h ? D(r[n], h) : D(r[n], c[E](n, T, e) || n + " is invalid.")) : Ue("Unknown rule: " + E);
    }
  }
  return !Et(r) || r;
}, he = 1, lr = 2, ir = 3, rr = 4, sr = 5, Rn = 6, il = 7, Ls = "punct", yn = (e) => V(e, /[$_\p{ID_Start}]/u), Nn = (e) => V(e, /[$_\u200C\u200D\p{ID_Continue}]/u), Sn = (e) => (e == null ? void 0 : e.type) === Ls, fr = (e) => (e == null ? void 0 : e.type) === "ref", On = (e) => {
  let t = [], l = [he], i = !1, r = 0, f = (o = 0) => e[r + o] || "", s = () => l[I(l) - 1], c = (o) => {
    let E = o - 1;
    for (; E >= 0 && V(e[E], /\s/); )
      E--;
    return {
      char: e[E],
      index: E
    };
  }, n = () => {
    let { char: o } = c(r);
    return o == null || "([{=,:;!&|?+-*%^<>".includes(o);
  };
  for (; r < I(e); ) {
    let o = e[r], E = f(1);
    if (s() === he && o === "/" && E === "/") {
      D(l, lr), r += 2;
      continue;
    }
    if (s() === he && o === "/" && E === "*") {
      D(l, ir), r += 2;
      continue;
    }
    if (s() === lr) {
      o === `
` && l.pop(), r++;
      continue;
    }
    if (s() === ir) {
      if (o === "*" && E === "/") {
        l.pop(), r += 2;
        continue;
      }
      r++;
      continue;
    }
    if (s() === he && o === "/" && E !== "/" && E !== "*" && n()) {
      D(l, rr), r++;
      continue;
    }
    if (s() === rr) {
      if (o === "\\") {
        r += 2;
        continue;
      }
      o === "/" && l.pop(), r++;
      continue;
    }
    if (s() === he && (o === '"' || o === "'")) {
      D(l, o), r++;
      continue;
    }
    if (s() === sr || s() === Rn) {
      if (o === "\\") {
        r += 2;
        continue;
      }
      o === (s() === sr ? '"' : "'") && l.pop(), r++;
      continue;
    }
    if (o === "`") {
      s() === il ? l.pop() : D(l, il), r++;
      continue;
    }
    if (s() === il) {
      if (o === "\\") {
        r += 2;
        continue;
      }
      let T = f(-1);
      if (o === "$" && E === "{" && T !== "\\") {
        D(l, he), i = !0, r += 2;
        continue;
      }
      r++;
      continue;
    }
    if (s() === he && o === "}" && l[I(l) - 2] === il) {
      l.pop(), i = !1, r++;
      continue;
    }
    if (s() === he && m(".?:(){}[];,@", o)) {
      D(t, {
        type: Ls,
        value: o,
        start: r,
        end: r + 1
      }), r++;
      continue;
    }
    if (s() === he && V(o, /\d/)) {
      let T = r;
      for (r++; r < I(e) && V(e[r], /[\d_a-z.]/i); )
        r++;
      let h = Ie(e, T, r);
      D(t, {
        type: ee,
        value: h,
        start: T,
        end: r
      });
      continue;
    }
    if (s() === he && yn(o)) {
      let T = r;
      for (r++; r < I(e) && Nn(e[r]); )
        r++;
      if (e[T - 1] === "#") continue;
      let h = Ie(e, T, r);
      i && D(t, {
        type: "ref",
        value: h,
        start: T,
        end: r
      });
      continue;
    }
    r++;
  }
  let a = /* @__PURE__ */ new Set();
  console.log("tokens", t);
  for (let o = 0; o < I(t); o++) {
    let E = t[o];
    if (!fr(E)) continue;
    let T = t[o - 1], h = t[o - 2];
    fr(h) && Sn(T) && T[g] === "." || a.add(E);
  }
  return [...a];
}, _n = (e, t, l, i) => Ie(e, 0, t) + i + Ie(e, l), An = [We, Ke, oi], Pn = (e, t) => {
  let l = On(t);
  for (let i = I(l) - 1; i >= 0; i--) {
    let r = l[i];
    for (let f of An) {
      let s = e.ctx[f];
      if (s && r[g] in s) {
        t = _n(t, r.start, r.end, f + "." + r[g]);
        break;
      }
    }
  }
  return t;
}, In = (e, t) => {
  let l = (c) => m(t, c), i = (c, n) => {
    if (l(c)) {
      let a = e[c], o = a[n];
      if (o && e[o] ? (l(o) || D(t, o), e[o].origin = c) : console.warn(`Step "${c}" does not have a valid "${n}" step to go to.`), !a.keep) {
        let E = cs(t, c);
        E >= 0 && t.splice(E, 1);
      }
    }
  };
  return [l, (c) => i(c, "next"), (c) => i(c, "back"), (c) => i(c, "origin")];
}, wn = Hf(nl), La = () => {
  let e = (u) => E.get(u), t = (u, p = () => !0) => {
    let R = u ? Sl(u) : dl;
    for (; R; ) {
      let _ = e(R);
      if (_ && p(_)) return _;
      R = Sl(R);
    }
  }, l = (u, p) => {
    let R = e(u);
    if (!R) {
      let _ = p && e(p) || t(p || u);
      R = {
        // Local context
        // @ts-ignore
        ctx: { ...U },
        // A reference to the element. Convenience for internal use.
        el: u,
        [zt]: _,
        // Unique ID context
        id: xe(_, "id", {}),
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
        [Z]: 0,
        ...y
      };
      for (let P in d) {
        let S = d[P](R, _);
        S && J(R.ctx, P, S, "we");
      }
      E.set(u, R), R[ue] = gn(R, H + ue)(R.ctx);
    }
    return R;
  }, i = async (u, p) => {
    M(u) && (u = ce(u)), M(p) && (p = ce(p)), ot(p) || (p = Q), ot(u) && (await c(u), await Ol(u, async (R) => {
      let _ = !1, P = u == R ? p : Q;
      return Bf(R) && Ss(R) ? _ = f(R, P) : $e(R) && (Ye(R) == ae && !He(R, Ii) ? _ = !1 : _ = await s(R, P)), _;
    }));
  }, r = async (u, p = !0, R = !0) => {
    await Ol(u, async (_) => {
      let P = e(_);
      if (P) {
        if (P[ke])
          for (let S of P[ke])
            await r(S, p, R);
        if (P[ft])
          for (let S of P[ft])
            await r(S, p, R);
        P.ph && St(P.ph), C(P.cFns, (S) => S()), R && E[G](_);
      }
      return p && St(_), !0;
    });
  }, f = (u, p) => {
    let R = u[Nt], _ = Ln(R || "");
    if (_ && V(_, xn)) {
      let P = l(u, p);
      _ = Pn(P, xl(_));
      let S = o(P, _, "", !0, !1);
      L(P, _t(() => u[Nt] = S(P.ctx))), ai(P, _e, R);
    }
    return !1;
  }, s = async (u, p) => {
    let R = l(u, p);
    if (Me(R, 3)) return !0;
    for (let [_, P] of T) {
      let S = [];
      if (Ts(_))
        Ns(u, (k, ll) => {
          V(k, _) && D(S, [k, ll]);
        });
      else {
        let k = Be(u, _);
        Kt(k) || D(S, [_, k]);
      }
      for (let [k, ll] of S) {
        if (Me(R, 1) || Me(R, 3)) break;
        ai(R, k, ll), await P(R, k, Ul(ll));
      }
      if (Me(R, 1) || Me(R, 3)) break;
    }
    return Me(R, 0) && (R[Z] = 1), Et(R[oe]) || E[G](u), !Me(R, 2) && !Me(R, 3);
  }, c = async (u) => {
    let p = await $s(u, dr, []);
    C(p, ([R, _]) => {
      let P = Ye(_), S = P != ae && P != ie ? fe : P;
      P == fe && !He(_, yt) && Ll(_, yt, "");
      let k = _[S == fe ? is : Bt];
      y[S][R] = b(k);
    });
  }, n = (u) => (p, R) => {
    y[u][p] = R;
  }, a = (u, p, R = "", _ = !0, P = !0) => {
    let S;
    return p = xs(P ? ms(u, p) : p, R, _), p in O ? S = O[p] : (S = Nl(), w[S] = gs(tl(u.ctx, p), p), O[p] = S), S;
  }, o = (u, p, R = "", _ = !0, P = !0) => {
    let S;
    try {
      let k = p in w ? p : a(u, p, R, _, P);
      S = w[k](u.ctx);
    } catch (k) {
      F(
        k[Yr]
        // '\nExpression:', exp, 
        // '\nElement:', bnode.el
      ), S = () => wn;
    }
    return S;
  }, E = pe(), T = [], h = {}, w = {}, O = {}, d = {
    // The $data context. Equivalent to creating a component.
    [Ke]: $n(Ke, Ve),
    // The $props context. Non-reactive properties passed to the element and its children as defined in the b-props directive schema.
    [jl]: (u, p) => (p == null ? void 0 : p.ctx[jl]) || {},
    // The $for context
    [We]: (u, p) => p == null ? void 0 : p.ctx[We],
    // Data Level Context:
    // Referenced under the same $data context, not including nested $data contexts
    [Kl]: nr(Kl),
    [Vl]: nr(Vl),
    // The element itself
    $el: (u) => u.el,
    // Unique identifier for the element
    $id: (u) => u.id,
    $cleanup: (u) => (p) => L(u, p)
  }, Y = {
    [fe]: n(fe),
    [ie]: n(ie),
    [ae]: n(ae),
    data: n(Jt)
  }, U = {
    [oi]: Oe({}),
    $set: Y,
    [bt]: i,
    [Zt]: r
  }, De = {}, X = Oe([]), [v, A, B, x] = In(De, X), N = {
    http: li,
    [te]: Oe,
    watch: Ht,
    effect: _t,
    computed: un,
    persist: cn,
    session: on,
    activeSteps: X,
    isStepActive: v,
    steps: De,
    nextStep: A,
    backStep: B,
    originStep: x,
    go: Dn,
    emit: Ml,
    listen: Ne,
    /** Get the local context of an element */
    context: (u) => {
      var p;
      return (p = e(ce(u))) == null ? void 0 : p.ctx;
    },
    // Tools
    hasProp: K,
    getProp: xe,
    setProp: J,
    sync: ut,
    [mr]: ve,
    [wf]: hn,
    uid: Nl,
    getType: ge
  };
  C(et(N), (u) => U[wt + u] = N[u]);
  let y = {
    [fe]: h,
    [ie]: {},
    [ae]: {},
    data: {},
    // ! HYDRATION
    [ls]: T,
    bnode: { n: l, g: e, a: E },
    // ! PUBLIC CONTEXT
    gc: U,
    exec: o
  };
  return U[Cl] = sn(y), C([Y, li, U, y], (u) => xi(u, "e")), y;
}, Dn = (e) => {
  Ae(e) ? history.go(e) : kf.href = e;
}, Me = (e, t) => e[Z] == t, L = (e, t) => {
  D(e.cFns, t);
}, Pt = (e, t) => {
  let l = e[zt];
  l && (l[ft] || (l[ft] = []), m(l[ft], t) || D(l[ft], t));
}, dn = (e) => ns(It(e), (t) => Sl(t)), It = (e) => {
  let t = [], { g: l } = e.bnode;
  return e.ph && D(t, e.ph), C(e[ke] || [e.el], (i) => {
    let r = l(i);
    r && K(r.attr, yt) ? D(t, ...It(r)) : D(t, i);
  }), t;
}, Cn = (e) => {
  C(It(e), (t) => {
    t != e.ph && St(t);
  });
}, gn = (e, t, l = {}) => {
  let i = () => l, r = $e(e.el) ? Be(e.el, t) : null;
  return Kt(r) || ai(e, t, r), r && b(r) && (r = Ul(r), i = e.exec(e, r, tl(e.ctx, r))), i;
}, ai = (e, t, l) => {
  e[oe][t] = l, $e(e.el) && $l(e.el, t);
}, Ul = (e) => ye(Te(Se(me(e, ne), (t) => Es(b(t), "//") ? "" : t), ne), /;\s*$/, ""), xn = /\${((?!.*\${).*?)}/, mn = /{{((?!.*{{).*?)}}/, Ln = (e, t = "${$1}") => Zl(e, mn, t), $n = (e, t, l) => (i, r) => {
  let f = i.el, s = r ? r.ctx[e] : dl, c = $e(f), n = c && He(f, t), a = c && (i[oe][Ce] || He(f, Ce)), o = c && (!s || n);
  return o && !n && t == Ve && Ll(f, Ve, ""), o && !a ? Oe({}, l) : s || {};
}, nr = (e) => (t, l) => !l || $e(t.el) && He(t.el, Ve) ? {} : l.ctx[e], $a = (e = {}) => {
  nl in Ge || (xi(e, "e"), J(Ge, nl, e, "e"), Ne(Ge, Oi, En)), Ml(Ge, nl);
}, Bl = (e) => (e.match(/^(b-\w+|bind|on)(-([\w-$]+))?$/) || [])[3] || "", kl = async (e) => {
  await ar(e, Cr), await ar(e, Ei);
}, ar = async (e, t) => {
  let l = t == Ei, i = e.ctx[l ? Kl : Vl], r = l ? [
    /*B_IF,*/
    wr,
    yt,
    Ve
  ] : [Ve];
  for (let f of e[ke] || [e.el]) {
    let s = await $s(f, t, r);
    C(s, ([c, n]) => {
      i[c] = l ? n : n[is], L(e, () => gt(i, c));
    });
  }
}, $s = async (e, t, l) => {
  let i = [], r = t != Ei;
  return await Ol(e, (f) => {
    if ($e(f)) {
      if (as(l, (c) => He(f, c))) return !1;
      let s = Be(f, t);
      s && ($l(f, t), D(i, [s, f]), r && St(f));
    }
    return !0;
  }, r), i;
}, xt = (e, t, l) => {
  let i = e.exec(e, t);
  L(e, _t(() => l(i)));
}, Ms = (e, t, l) => {
  let i = [];
  return l && (l in t ? D(i, t[l]) : (l = e.exec(e, l)(), l in t ? D(i, t[l]) : $(l) && C(l, (r) => {
    r in t && D(i, t[r]);
  }))), i;
}, Mn = async (e, t) => {
  e[Z] = 3;
}, vn = [Dr, Mn], cr = /^[a-z_$][\w$]*$/i, Fn = (e, t, l) => {
  let i = e.el, { n: r, g: f } = e.bnode;
  e[Z] = 3;
  let [s, c] = Se(me(l, " in "), b), [n, a] = Se(me(s, ","), b);
  a || (a = Vs);
  let o = se("the", t, je, Di);
  if (!V(n, cr) || !V(a, cr))
    return F(o, ef, "alias.");
  let E = e.exec(e, c), [T, h] = Ps(E), w = T ? T[h] : E(), O = T && At(w), d = !1;
  if (Ae(w) && (w = Oe(Wi(w, 1)), d = !0, T && _t(() => {
    let A = T[h] || 0;
    Ae(A) && ut(w, Wi(A, 1));
  }, () => T[h])), !($(w) || z(w)))
    return F(o, `an ${ht}, ${Dt}, or ${ee}.`);
  e.ph = $i(t), we(i, kt, e.ph), Pt(e, i);
  let Y = {}, U = async ([A, B]) => {
    let x = ys(i);
    we(e.ph, qt, x);
    let N = r(x, i);
    N[oe][t] = "", K(e[oe], Ce) && (N[oe][Ce] = "");
    let y = Oe({}, N.ctx[We]);
    J(y, n, B, "we"), J(y, a, A, "we"), J(N.ctx, We, y, "we"), L(N, () => {
      ni(y);
    }), L(N, Ht(y, a, ({ [at]: u }) => {
      let p = Y[A][1];
      u !== p && (y[a] = p);
    })), O && L(N, Ht(y, n, () => {
      w[y[a]] = y[n];
    })), Y[A] = [x, A], await kl(N), await e.gc[bt](x, i);
  }, De = ([A, B]) => {
    let x = Y[A], N = f(x && x[0]);
    if (N) {
      let y = N.ctx[We];
      y[n] = B, y[a] = A, x[1] = A;
    }
  }, X = ([A, B]) => {
    let [x] = Y[A];
    e.gc[Zt](x), gt(Y, A);
  }, v = {
    [Qt]: U,
    [Zr]: De,
    [G]: X
  };
  for (let A of tt(w))
    U(A);
  T && L(e, Ht(w, Q, ({ [Ni]: A, prop: B, [at]: x }) => {
    v[A]([B, x]);
  })), L(e, () => {
    for (let A in Y)
      X([Number(A), null]);
    d && ni(w);
  });
}, Un = [wr, Fn], Bn = async (e, t, l) => {
  var f;
  let i = e.data[l];
  !Le(i) && l && (i = e.exec(e, l, tl(e.ctx, l) + ",$" + zt));
  let r = Le(i) ? await i(e.ctx, ((f = e[zt]) == null ? void 0 : f.ctx[Ke]) || {}) : {};
  if (!z(r))
    return e[Z] = 3, F(gf(je, t, "an " + Dt, ge(r)));
  for (let s in r) J(e.ctx[Ke], s, r[s], Wf(r, s));
  await kl(e), L(e, () => {
    el(() => {
      ni(e.ctx[Ke]);
    });
  });
}, kn = [Ve, Bn], or = {}, Hn = async (e, t, l) => {
  if (l) {
    let i = e.exec(e, l)();
    if (!$(i) || !Wt(i, M))
      return F("the", t, je, q, `an ${ht} of ${de}(s).`);
    e.id = i.reduce((r, f) => {
      let s = Nl(5);
      return or[s] = !0, J(r, f, s, "e"), r;
    }, {}), L(e, () => {
      for (let r in e.id) gt(or, e.id[r]);
    });
  }
}, Yn = ["b-id", Hn], vs = (e) => (t, l, i) => {
  if (!(K(t[oe], yt) || K(t[oe], br) && e == _e)) {
    let r = t[ue][l] || {};
    t[Z] = 2;
    let f = t[fe];
    i in f && (i = xl(i)), i && xt(t, i, async (s) => {
      await t.gc[Cl](t.el, e, s(), r), t[Z] = 3;
    });
  }
}, Gn = [br, vs(Ft)], zn = [lf, vs(_e)], Wn = async (e, t, l) => {
  let i = e[ue][t] || {}, r = e.el, f = l ? e[fe][l] || e.exec(e, l)() : r[Bt];
  e[Z] = 2, M(f) ? (e[ke] = await e.gc[Cl](r, qt, b(f), i), Pt(e, r), St(r)) : Ue(t + ":", Gt, g, ne, f);
}, Kn = [yt, Wn], Vn = async (e, t, l) => {
  let i = e.el;
  e[Z] = 2;
  let r = Ms(e, e[ae], l);
  if (Ye(i) == ae) {
    Pt(e, i);
    let f = Be(i, "src"), s = f ? await li.get(f) : Ss(i);
    s && D(r, s), St(i);
  }
  for (let f of r) {
    if (M(f)) {
      let s = Ci(f);
      f = gs(tl(e.ctx, f), Ul(f), s), s && (f = f(e.ctx));
    }
    Le(f) && await f(e.ctx);
  }
}, Xn = [Ii, Vn], jn = new RegExp("(?<=(?:^|})\\s*)\\S(?:.\\s*?)*?(?=\\s*{)", "g"), qn = (e, t, l) => {
  let i = e.el;
  if (l && Ye(i) != ie) {
    let r = Ms(e, e[ie], l), f = Nl();
    Os(i, f), f = "." + f;
    let s = ti(ie);
    we(i, pt, s);
    let c = Te(r, ne);
    c = ye(c, /([{;])\s*/g, "$1" + ne + "    "), c = ye(c, /\s*}\s*/g, ne + "}" + ne), s[Nt] = ye(c, jn, (n) => {
      let a = b(n);
      return m(n, "&") ? a = ye(a, /&/g, f) : a = Te(Se(me(a, ","), (o) => f + " " + b(o)), "," + ne), a;
    }), e.gc[bt](s, i), L(e, () => {
      e.gc[Zt](s);
    });
  }
}, Qn = [H + ie, qn], Jn = (e, t, l) => {
  let i = l, r, f = e.ctx.$ref;
  i in f && (i = xl(i)), xt(e, i, (s) => {
    i = s(), $(i) && ([i, r] = i), M(i) && i in f && (i = f[i]), m([qt, pt, Xl, Tl], r) || (r = pt), ot(i) ? (we(i, r, ...It(e)), Pt(e, e.el)) : Ue(qr, Fe, Gr, t + `="${l}"`);
  });
}, Zn = [H + qr, Jn], Il = pe(), bn = (e, t, l) => {
  if (e[ke]) return;
  if (!(K(e[oe], Ce) ? Ce : K(e[oe], al) ? al : ""))
    return F("the", t, je, q, "used with", Ce, "or", al + ".");
  let r = e.exec(e, l)();
  $(r) || (r = [r]);
  let [f, s] = r;
  if (!z(f))
    return F("the", t, q, "an", Dt + ".");
  z(s) || (s = f);
  let c = ta(e.el, f, s);
  Il.set(e.el, c), L(e, c[Ze]), L(e, () => Il[G](e.el));
}, ea = [H + ct, bn], Er = (e, t, l, i) => {
  let [r, f] = _l(t), [s, c] = _l(l);
  Pl(e, f, r, s), Vt(e, c, i ? { [ct]: "none" } : {}), Ot(() => {
    Vt(e, s), Pl(e, c);
  });
}, ur = (e, t, l) => {
  let [i, r] = _l(t), [f, s] = _l(l);
  Pl(e, r, i), Vt(e, s, f);
}, Tr = () => (/* @__PURE__ */ new Date()).getTime(), ta = (e, t, l) => {
  if (!$e(e))
    return F(Gt, ct, Fe, e);
  let i = null, r = 1, f = 2, s = 3, c = 4, n = r, a = tn(e[ie]), o = 0, E = Ne(e, ct + "run", (d) => {
    d[re] === e && (o = Tr());
  }), T, h = Ne(e, ct + Mr, (d) => {
    d[re] === e && (n == f ? n = c : n == s && (n = r), Pl(e, t, l), Vt(e, a), T && T());
  }), w = () => {
    E(), h();
  }, O = (d, Y) => {
    T = Y;
    let U = Tr();
    d && i && n == c || !d && i === !1 && n == c || (d ? i === !1 && n == f ? (n = s, Er(e, t, l)) : (Er(e, l, t, n == r), i = !0, n = f) : i === null ? (i = !1, n = c, T && T()) : i && n == f ? (n = s, ur(e, l, t)) : (i = !1, n = f, ur(e, t, l)), el(() => {
      o < U && T && T();
    }, 50));
  };
  return J(O, Ze, w, "wce"), O;
}, la = (e, t, l) => {
  let i = e.el;
  e.ph = $i(t), we(i, kt, e.ph), e[Z] = 3, Pt(e, i);
  let { n: r } = e.bnode, f, s, c = () => {
    e.gc[Zt](f.el), f = Q;
  };
  xt(e, l, (n) => {
    let a = n();
    Ot(async () => {
      if (a) {
        if (!f) {
          let o = ys(i);
          we(e.ph, pt, o), f = r(o, i), f[oe][Ce] = "", await kl(f), await e.gc[bt](o, i), Pt(e, o);
        }
        s = Il.get(f.el), s && s(!0);
      } else !a && f && (s ? s(!1, c) : c());
    });
  });
}, ia = [Ce, la], $t = pe(), ra = (e, t, l) => {
  e.ph = $i(t), we(dn(e), qt, e.ph);
  let i, r = () => {
    Cn(e), $t.set(e.ph, e);
  };
  xt(e, l, (f) => {
    let s = f();
    Ot(() => {
      let c = It(e);
      if (i = Il.get(e.el), s) {
        if ($t.has(e.ph)) {
          for (let n of c)
            if ($t.has(n) && n !== e.ph) {
              let a = $t.get(n), o = It(a);
              c = di(c, (E) => !m(o, E) || E === a.ph);
            }
          $t[G](e.ph), we(e.ph, pt, ...c);
        }
        i && i(!0);
      } else i ? i(!1, r) : r();
    });
  });
}, sa = [al, ra], rl = (e, t, l) => {
  let i = Bl(t), [r] = me(i, "-"), f = e[ue][t] || {}, s = e.exec(e, l, "$entry", !1), c = ml(s, f[Yt] || 100), n = new IntersectionObserver((a) => {
    C(a, (o) => {
      o.isIntersecting != (r == Fr) && (c(o), f[Qs] && n[pl]());
    });
  }, f);
  n[yi](e.el), L(e, () => n[pl]());
}, fa = [
  [Fi, rl],
  [H + Fi, rl],
  [Ui, rl],
  [H + Ui, rl]
], pr = (e, t, l) => {
  let i = Bl(t);
  me(i, "-");
  let r = e[ue][t] || {}, f = r[pi] ? ce(hi) : e.el, s = e.exec(e, l, "$size", !1), c = ml(s, r[Yt] || 100), n = new ResizeObserver((a) => {
    let o = a[0].borderBoxSize[0];
    c([o.inlineSize, o.blockSize]);
  });
  n[yi](f, r), L(e, () => n[pl]());
}, na = [
  [Bi, pr],
  [H + Bi, pr]
], Mt = "keyup", it = "keydown", hr = "outside", aa = "window", Fs = "control", ci = "meta", sl = "arrow", Rr = "repeat", ca = [
  ci,
  Fs,
  "shift",
  "alt"
], oa = {
  ctrl: Fs,
  cmd: ci,
  [bs]: ci,
  esc: "escape",
  del: G,
  up: sl + "up",
  down: sl + "down",
  left: sl + "left",
  right: sl + "right"
}, Ea = (e, t, l) => {
  let i = Bl(t), [r, ...f] = me(i, "-"), s = e.el, c = s, n = e.exec(e, l, wt + Ks), a = (O) => {
    let d = n(O);
    Le(d) && d(O);
  }, o = e[ue][t] || {};
  C(f, (O) => {
    o[O] = !0;
  }), Yt in o && (a = ml(a, o[Yt])), Yi in o && (a = jf(a, o[Yi])), o[hr] || o[pi] ? c = Ct : o[aa] && (c = Ge);
  let E = {};
  m([it, Mt], r) && C(xe(o, "keys", []), (O) => {
    E[Ee(oa[O] || O)] = !0;
  });
  let T = (O) => {
    o[zr] && O[Rf](), o.stop && O.stopPropagation(), !(o.self && O[re] !== O.currentTarget) && (o[hr] && (s.contains(O[re]) || !bf(s)) || m([it, Mt], r) && !(Et(E) == Et(h) && Wt(et(E), (d) => h[d])) || a(O));
  }, h = {}, w = Et(E);
  m([it, Mt], r) && w ? (L(e, Ne(c, it, (O) => {
    if (o[Rr] === !1 && O[Rr]) return;
    let d = Ee(O.key);
    h[d] = !0, it == r && T(O), h.meta && !m(ca, d) && Wl(O, h);
  })), L(e, Ne(c, Mt, (O) => {
    it == r && Wl(O, h), Mt == r && (T(O), el(() => Wl(O, h)));
  })), L(e, Ne(c, "focus", () => {
    hs(h);
  }))) : L(e, Ne(c, r, T, o));
}, Wl = (e, t) => gt(t, Ee(e.key)), ua = [/^(b-on|on)-([\w-$]+)$/, Ea], Ta = (e, t, l) => {
  let i = e.el, r = Bl(t), f = xs(ms(e, l || Mf(r)), "$initial");
  r = en(r);
  let s = Be(i, r), c = e[ue][t] || {};
  xt(e, f, (n) => {
    if (!n)
      return Ue(l, Ql, gl(t + `="${l}"`), ne, i);
    let a = n(s || ""), o = c.prop || _s(r) && r;
    if (a || o)
      if (r == ie && z(a))
        Vt(i, a);
      else if (r == xr && z(a))
        for (let E in a)
          a[E] ? Os(i, E) : qf(i, E);
      else
        Ll(i, r, !o && a === !0 ? "" : a, o);
    else $l(i, r);
  });
}, pa = [/^(b-bind|bind)-([\w-$]+)$/, Ta], fl = pe(), ha = (e, t, l) => {
  let i = se("the", t, je), r = j + "ed", f = t + `="${l}"`, s = e.el, c = Ye(s), n = s.type;
  if (!m([W, st, j], c))
    return F(i, gr, W, `, ${st}, and ${j} ${Fe}s.`, f, s);
  let [a, o] = Ps(e.exec(e, l));
  if (!a)
    return F(i, Ql, f, s);
  let E = a[o], T, h = () => Xe(c == j ? s[ue] : U()), w = e[ue][t] || {}, O = (N) => {
    let y = N[!He(N, g) && Y ? rt : g], u = fl.get(N) || w;
    if (M(y) && (u.trim && (y = b(y)), !u.raw)) {
      let p = gi(y);
      (Ae(p) || Kt(p) || Uf(p)) && (y = p);
    }
    return y;
  }, d = (N) => c == W && m(N, n), Y = d([lt, Hi]), U = () => Li(W + `[type="${lt}"][name="${s.name}"]`), De = () => d(lt) && I(U()) > 1, X = () => {
    let N = [
      [W, lt, [ee, de, cl, ht]],
      [W, Hi, [ee, de, cl]],
      [W, ee, [ee]],
      [W, "range", [ee]],
      [W, "", [ee, de]],
      [st, "", [ee, de]],
      [j, "", [ee, de, cl, ht]]
    ];
    for (let [y, u, p] of N)
      if (c == y && (!u || n == u)) {
        Kt(E) || yl(E) || m(p, ge(E)) || Ue(i, Ql, nt, Te(p, " or "), `for ${c == W ? n + " " : ""}${y} ${Fe}s,`, gl(ge(E)), f, s);
        break;
      }
  };
  Ot(() => {
    X(), j == c ? C(h(), (N) => fl.set(N, w)) : d(lt) && fl.set(s, w);
  });
  let v = () => {
    if (E = a[o], T = O(s), m([W, st], c))
      if (n == lt && $(E))
        s[rt] = m(E, T);
      else if (Y)
        s[rt] = E === T;
      else {
        if (s[Rl] || Ct.activeElement === s && E === T) return;
        E !== T && (s[g] = E);
      }
    else c == j && ($(E) ? C(h(), (N) => {
      N[r] = m(E, O(N));
    }) : s[g] = E);
  };
  Ot(() => L(e, _t(v)));
  let A = {}, B = () => {
    if (E = a[o], c == j && s.multiple || De()) {
      let N = [];
      C(h(), (y) => {
        c == j && fl.set(y, w), (y[r] || y[rt]) && D(N, O(y));
      }), a[o] = N;
    } else a[o] = Y && !s[rt] ? !1 : O(s);
  };
  (d([_e, "search", "url", "tel", ol, "password"]) || c == st) && (A[sf] = Qf, A[ff] = Jf);
  let x = w.lazy || Y || c == j ? "change" : W;
  A[x] = B;
  for (let [N, y] of tt(A))
    L(e, Ne(s, N, y));
}, Ra = ["b-model", ha], le = "output", ze = "cursor", Tt = ze + "Updated", ya = "updateCursor", Na = (e, t, l) => {
  let i = e.el;
  if (!(g in i && Gl in i))
    return F("the", t, je, gr, st, Fe + "s and textual", W, "types (text, email, etc.).");
  let r = {
    char: Hl,
    letter: Ia,
    [ee]: Us,
    alpha: wa,
    money: Aa
  }, f = {
    exp: () => {
    },
    [g]: "",
    [ze]: i[Gl],
    [ya]: jt,
    [Tt]: !1,
    [le]: "",
    ...r
  };
  f.exp = e.exec(e, l, tl(r, l));
  let s = () => {
    f[g] = i[g], f[g] != f[le] && (f[ze] = i[Gl], Sa(f), i[g] = f[le], i.setSelectionRange(f[ze], f[ze]), Ml(i, Hr, f));
  };
  Ot(s), L(e, Ne(i, W, s, !0));
}, Sa = (e) => {
  e[Tt] = !1, e[le] = "";
  let t = e.exp(e);
  if (Le(t)) {
    t(e);
    return;
  }
  let l = e[g], i = 0, r = I(l);
  C([...t], (f, s) => {
    M(f) && I(f) > 1 && t.splice(s, 1, ...me(f, ""));
  });
  for (let [f, s] of tt(t)) {
    if (i >= r) break;
    if ($(s)) {
      let c = 0, [n, a, o] = s;
      for (; i < r && c < o; ) {
        if (n(l[i]))
          c++, e[le] += l[i];
        else {
          let E = !1, T, h = f;
          for (; h > -1 && (T = Oa(t, h + 1)); ) {
            if (_a(T, l, i)) {
              E = !0;
              break;
            }
            h = cs(t, T, h);
          }
          if (E && c >= a) break;
        }
        i++, jt(e, i);
      }
    } else M(s) && (e[le] += s, l[i] == s && i++, jt(e, i));
  }
}, Oa = (e, t) => {
  for (let l = t; l < I(e); l++) {
    let i = e[l];
    if ($(i))
      return i;
  }
}, _a = (e, t, l) => {
  let i = !1;
  if ($(e)) {
    let [r, f, s] = e;
    if (Le(r) && Ae(f) && Ae(s)) {
      let c = 0, n = I(t);
      for (let a = l; a < n && c < s; a++)
        r(t[a]) && c++;
      i = c > 0 && c >= f;
    }
  }
  return i;
}, Aa = (e = {}) => (t) => {
  let l = t[g], i = I(l), r = xe(e, "thousands", ","), f = xe(e, "decimal", "."), s = xe(e, "precision", 2);
  f == "," && (r = "."), r == "." && (f = ",");
  let c = !1, n = !1, a = [], o = [], [E] = Us();
  for (let h = 0; h < i; h++)
    l[h] == "-" ? !I(a) && !I(o) && (c = !0) : n ? I(o) < s && E(l[h]) && D(o, h) : l[h] == f ? n = !0 : E(l[h]) && (I(a) == 1 && l[a[0]] == "0" ? a[0] = h : D(a, h));
  t[le] = c ? "-" : "";
  let T = I(a);
  t[Tt] = !1;
  for (let h = 0; h < T; h++)
    h > 0 && (T - h) % 3 == 0 && (t[le] += r), t[le] += l[a[h]], jt(t, a[h] + 1);
  t[le] += n ? f : "";
  for (let h = 0; h < I(o); h++)
    t[le] += l[o[h]], jt(t, o[h] + 1);
  return t;
}, jt = (e, t) => {
  if (!e[Tt]) {
    let l = e[ze];
    l == 0 ? e[Tt] = !0 : l <= t && (e[Tt] = !0, e[ze] = I(e[le]));
  }
}, Pa = (e = 1, t = 1) => (e = Ae(e) && e >= 0 ? e : 1, t = Ae(t) && t > e ? t : e > 0 ? e : 1, [e, t]), Hl = (e, t, l) => Ts(e) || $(e) && Wt(e, (r) => M(r) && I(r) == 1) ? [$(e) ? (r) => m(e, r) : (r) => V(r, e), ...Pa(t, l)] : F("Invalid mask character definition. Expected an array of characters or a regular expression."), Ia = (e, t) => Hl(new RegExp("\\p{L}", "u"), e, t), Us = (e, t) => Hl(new RegExp("\\p{Nd}", "u"), e, t), wa = (e, t) => Hl(/[\p{L}\p{Nd}]/u, e, t), Da = [H + Hr, Na], da = async (e, t, l) => {
  xt(e, l, (i) => {
    let r = i();
    console.warn("Effect value:", r), Le(r) && r();
  });
}, Ca = ["b-effect", da], Yl = (e, t, l) => (i, r, f) => {
  let s = i[ue][r] || {}, c = {
    [e]: !0
  };
  t.subtree = !1;
  for (let E in t)
    c[E] = s[E] || t[E];
  let n = i.exec(i, f, "$mutations", !1), a = ml(n, s[Yt] || 100), o = new MutationObserver((E) => {
    E = ga(e, l, E), I(E) && a(E);
  });
  o[yi](s[re] || i.el, c), L(i, () => o[pl]());
}, ga = (e, t, l) => di(l, (i) => i.type === e && t(i)), yr = Yl(
  "childList",
  {},
  (e) => I(e.addedNodes)
), Nr = Yl(
  "childList",
  {},
  (e) => I(e.removedNodes)
), Sr = Yl(
  "attributes",
  { attributeOldValue: !0, attributeFilter: Q },
  () => !0
), Or = Yl(
  "characterData",
  { characterDataOldValue: !0 },
  () => !0
), _r = Qe + "added" + ke, Ar = Qe + "removed" + ke, Pr = Qe + "attrs", Ir = Qe + "text", xa = [
  [_r, yr],
  [H + _r, yr],
  [Ar, Nr],
  [H + Ar, Nr],
  [Pr, Sr],
  [H + Pr, Sr],
  [Ir, Or],
  [H + Ir, Or]
], ma = [
  /**
   * The b-ignore directive is used to stop the hydration of the element and its children.
   */
  vn,
  /**
   * Conditional hydration
   * Notes:
   * - b-if stops the hydration flow of the element and starts a new hydration flow with a copy of the element whenever the condition evaluates to true
   * - the original element is replaced with a placeholder comment node to hold its location in the DOM
   * - whenever the condition evaluates to false, the copy of the element is dehydrated and removed from the DOM
   */
  ia,
  /**
   * Data context
   * Notes:
   * - the order of inference is: $for, $data, $props, $store
   * - b-slot and b-ref are hydrated after b-data
   */
  kn,
  /** List rendering
   * Notes:
   * - b-for stops the hydration flow of the element and starts a new hydration flow for each item it creates
   */
  Un,
  /**
   * Unique ID generator
   */
  Yn,
  /**
   * Run one or more scripts on the element, right after the context ($props, $data, $slot, $ref, $for, $id) is set up.
   * Notes:
   * - the b-script directive may hold one script or an array of scripts
   * - the script(s) are executed in order and awaited
   * - when b-script is in a script element the content of the src file or text content is added to the list of scripts to be executed
   */
  Xn,
  /**
   * Static template hydration
   * Notes:
   * - the inner HTML of the element is used as a template and it may include more than one root element
   * - the element that contains the b-template directive is removed from the DOM and its content is inserted in its place
   *   and because of that:
   *   - the b-template directive SHOULD NOT be used with elements that are self-closing (e.g. <img />, <input />, etc.)
   *   - the b-template directive CANNOT be used with: b-html, b-text, b-style, bind-*, b-model, b-mask, b-transition, on-*
   *     this is because these directives need to be hydrated on the element itself and not on its content
   *   - the b-template directive CAN be used with: b-ignore, b-props, b-data, b-ref, b-slot, b-if, b-for, b-id, b-script, b-show, b-teleport, b-effect
   */
  Kn,
  /**
   * Conditional display
   * Notes:
   * - the element is hydrated regardless of the condition
   * - the b-show directive toggles the `display` of the element based on the condition
   */
  sa,
  // ['b-boost', hydrateBoost],
  ea,
  // b-transition, b-transition-play, b-transition-reverse
  /**
   * The b-teleport moves the element to a different location in the DOM.
   * Notes:
   * - b-teleport also works with the b-if and b-template directives
   */
  Zn,
  /**
   * Dynamic hydration of HTML or text content and styles
   * Notes:
   * - if the element has a b-html and b-text directive, the b-html directive is hydrated and the b-text directive is ignored
   * - b-style always hydrates regardless of the b-html and b-text directives
   */
  Gn,
  zn,
  /**
   * Dynamic insertion of styles
   * Notes:
   * - the style element is inserted after the element that contains the b-style directive
   */
  Qn,
  /**
   * Data binding directives
   * Used to bind data to an element's property or attribute
   * 
   * - The `b-bind-|bind-` directive is a general directive used to bind data to an element property or attribute
   * - The `b-model` directive is used to create a two-way data binding between an input value and a reactive property
   * - The `b-mask` directive is used to format an input value using a mask
   */
  pa,
  // [b-bind|bind]-[attributeName]
  Ra,
  Da,
  /**
   * Event directives
   */
  ...fa,
  // [b-on|on]-[enter|exit]
  ...xa,
  // [b-on|on]-[addednodes|removednodes|attrs|text]
  ...na,
  // [b-on|on]-[resize]
  ua,
  // [b-on|on]-[eventName]
  /**
   * b-effect: used to create an effect that run when its dependencies change.
   * It is perfect for small expressions, reactive or not.
   * Example: console.log(`Hello, ${$data.name}!`)
   */
  Ca
], Ma = (e) => {
  C(ma, (t) => D(e[ls], t));
};
export {
  pa as bindDirective,
  kn as dataDirective,
  Ca as effectDirective,
  Un as forDirective,
  Gn as htmlDirective,
  Yn as idDirective,
  ia as ifDirective,
  vn as ignoreDirective,
  fa as intersectionDirectives,
  Da as maskDirective,
  Ra as modelDirective,
  xa as mutationDirectives,
  La as newApp,
  ua as onDirective,
  na as resizeDirectives,
  Xn as scriptDirective,
  Ma as setAllDirectives,
  $a as setup,
  sa as showDirective,
  Qn as styleDirective,
  Zn as teleportDirective,
  Kn as templateDirective,
  zn as textDirective,
  ea as transitionDirective
};
//# sourceMappingURL=briojs.2.1.0.js.map
