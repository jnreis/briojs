let sl = "brio", Pt = "$", rt = "$for", zl = "$ref", Wl = "$slot", yr = "$store", Tt = "after", ol = "append", ut = "array", gs = "async", ce = "attr", Pl = "Attribute", Y = "b-", Sr = "b-for", de = "b-if", Nr = "b-ignore", ai = "b-ref", Ar = "b-save", fl = "b-show", Or = "b-slot", qt = "before", xs = "body", al = "boolean", _r = "can only be used on", ms = "Cannot ", Ze = "checkbox", et = "checked", Ls = "Child", Pr = "class", Ir = "clone", ni = "composi", ci = "content", Dr = "Content", jt = "create", Qt = "data", Yt = "debounce", $s = "detail", vs = "default", dr = "define", z = "delete", We = "directive", Tl = "disconnect", Ms = "display", Ei = "document", Me = "element", nl = "email", wr = "end", xi = "entries", mi = "error", Fs = "event", Cr = "EventListener", gr = "exit", Ke = "get", xr = "has", mr = "head", oi = "html", Ti = "HTML", Il = "hydrate", Us = "index", Bs = "inner", Hs = "insert", kt = "Invalid", Lr = "length", $r = "mask", vr = "message", Ys = "method", X = "must be", fe = `
`, st = "newValue", ul = "Node", Ue = "nodes", Mr = "not found.", Dl = null, ie = "number", It = "object", ui = "observe", vt = "oldValue", Ve = "on-", Li = Ve + "enter", $i = Ve + gr, vi = Ve + "resize", ks = "once", pi = "operation", oe = "options", Gs = "outer", Gt = "parent", Mi = "patch", zs = "post", Kl = "prepend", Fr = "prevent", Ur = "Propert", Xe = Ur + "y", pt = "props", Br = "put", Fi = "radio", qe = "remove", hi = "replace", Hr = "require", ae = "script", Q = "skip", V = "select", Yr = "set", b = "state", kr = "start", Ri = "storage", De = "string", te = "style", Ws = "super", Gr = "teleport", se = "template", Ae = "text", Ui = "throttle", yi = "tion", zr = "toString", ft = "transition", Wr = "type", q, Kr = "update", Si = "valid", m = "value", Ni = "With", Ks = "a " + Si, Vs = "add" + Cr, at = Pt + Qt, Jt = "$de" + Il, Zt = Pt + Il, dl = Pt + Hs, Vl = Pt + pt, Ge = Y + Qt, Vr = Y + oi, Ai = Y + ae, ht = Y + se, Xs = Y + Ae, Xr = Ls + "ren", qr = Pr + "List", qs = Ir + ul, pl = ni + "ng", js = ni + yi + kr, Qs = ni + yi + wr, Js = jt + "Comment", Zs = jt + "Element", Xl = dr + Xe, bs = dr + Ur + "ies", lt = "de" + Il + Xr, Bi = z + Xe, jr = We + "s", ef = "ends" + Ni, Oi = "func" + yi, tf = Ke + Pl, lf = Ke + Xe + "Value", rf = Ke + Xe + "Priority", sf = xr + Pl, Hi = mr + "ers", Ut = Bs + Ti, W = "in" + Br, it = "of " + Wr, Qr = Gs + Ti, Jr = "Own" + Xe, ff = Gt + ul, af = Fr + "Default", Zr = "proto" + Wr, nf = qe + Pl, cf = qe + Cr, Ef = qe + Xe, Bt = hi + Ni, Mt = hi + Xr, _i = Hr + "s", cl = Hr + "d", Yl = V + "ionStart", of = V + "or", Tf = Yr + Pl, uf = Yr + Xe, pf = kr + "s" + Ni, hf = Ri + "Area", le = "tar" + Ke, tt = Ae + "area", Rt = Ae + Dr, Rf = Si + "ate", yf = gs + Oi, br = Ke + Jr + "Descriptor", Sf = br + "s", Nf = xr + Jr, Af = (e, t, l, i) => `the ${e} ${t} ${_i} ${l}, ` + wl(i), wl = (e) => `but got ${e} instead.`, ql = _i + " a reactive " + m, v = (e, ...t) => e.push(...t), Of = (e, t) => e.sort(t), Te = (e, t) => e.join(t), w = (e, t) => e.forEach(t), ye = (e, t, l) => e.map(t, l), Pi = (e, t, l) => e.filter(t, l), es = (e, t, l) => e.find(t, l), zt = (e, t, l) => e.every(t, l), ts = (e, t, l) => e.some(t, l), _f = (e, t, l) => e.indexOf(t, l), Pf = (e, t) => t[1] - e[1], ze = (e) => Array.from(e), Yi = (e, t = 0) => ye(ze({ [Lr]: e }), (l, i) => t + i), J = (e) => e.trim(), Ee = (e) => e.toLowerCase(), ge = (e, t, l) => e.split(t, l), If = (e, t) => e.match(t), ls = (e) => e.toUpperCase(), pe = (e) => ls(e[0]) + Ct(e, 1), Df = (e) => Ee(e[0]) + Ct(e, 1), is = (e, t, l) => e[pf](t, l), jl = (e, t, l) => e[ef](t, l), xe = (e, t) => t.test(e), he = (e, t, l) => e[hi](t, l), ki = (e, t, l) => {
  for (; xe(e, t); )
    e = he(e, t, l);
  return e;
}, Ii = (e) => xe(J(e), /^((async\s+)?function\s*\([^)]*\)\s*{[^}]*}|(async\s*)?(?:\([^()]*\)|[$\w]+)\s*=>)/), df = (e) => Df(Te(ye(ge(e, "-"), pe), "")), rs = (e) => JSON.stringify(e), Di = (e, t) => {
  try {
    e = JSON.parse(e, t);
  } catch {
  }
  return e;
}, Cl = (e) => "`" + e + "`", re = (...e) => Te(e, " "), we = (e) => Ee(Ct(_e[Zr][zr].call(e), 8, -1)), je = (e, t) => we(e) === t, Wt = (e) => e === Dl, hl = (e) => e === q, G = (e) => je(e, It), x = (e) => je(e, ut), me = (e) => wf(e) || Cf(e), wf = (e) => je(e, Oi), Cf = (e) => je(e, yf), L = (e) => je(e, De), Oe = (e) => je(e, ie) && !isNaN(e), gf = (e) => je(e, al), ss = (e) => Dt(e, fs), Dt = (e, t) => e instanceof t, nt = (e) => Dt(e, Node), xf = (e) => Dt(e, Text), Le = (e) => Dt(e, HTMLElement), Ql = (e) => Dt(e, Map), Jl = (e) => Dt(e, Set), Ye = window, _e = Object, xt = Reflect, mf = location, dt = Ye[Ei], Lf = Symbol, fs = RegExp, K = (e, t) => _e[Zr][Nf].call(e, t), Ce = (e, t, l) => {
  let i = l;
  try {
    i = t in e ? e[t] : l;
  } catch {
  }
  return i;
}, wt = (e, t) => delete e[t], $f = [
  ["w", "writable"],
  ["e", "enumerable"],
  ["c", "configurable"]
], j = (e, t, l = q, i = "") => {
  if (L(i)) {
    let r = i;
    i = { [m]: l }, w($f, ([f, a]) => {
      i[a] = $(r, f);
    });
  }
  _e[Xl](e, t, i);
}, ct = (e) => d(Qe(e)), Qe = (e) => _e.keys(e), vf = (e = Dl) => _e[jt](e), Mf = (e, t = {}) => {
  const l = vf(e);
  return _e[bs](
    l,
    _e[Sf](t)
  ), l;
}, Ff = (e, t, l = _e) => l[br](e, t), Uf = (e) => _e.getPrototypeOf(e), di = (e, t = {}) => {
  w(Qe(e), (l) => {
    j(e, l, e[l], t);
  });
}, as = (e) => w(Qe(e), (t) => {
  wt(e, t);
}), ue = (e = q) => new Map(e), wi = (e = q) => new Set(e), Bf = (e, t) => new fs(e, t), Et = (e, t) => {
  if (e === t) return e;
  if (x(e) && x(t)) {
    for (; d(e) > d(t); ) e.pop();
    for (let l = 0; l < d(t); l++)
      l < d(e) ? e[l] = Et(e[l], t[l]) : e.push(ve(t[l]));
  } else if (Ql(e) && Ql(t)) {
    let l = ue(e);
    e.clear();
    for (let [i, r] of Je(t))
      e.set(i, l.has(i) ? Et(l.get(i), r) : ve(r));
  } else if (Jl(e) && Jl(t)) {
    e.clear();
    for (let l of t)
      e.add(l);
  } else if (G(e) && G(t)) {
    let l = { ...e };
    as(e);
    for (let i in t)
      K(t, i) && (e[i] = K(l, i) ? Et(l[i], t[i]) : ve(t[i]));
  } else
    return t;
  return e;
}, ve = (e) => {
  let t = e;
  if (G(e)) {
    let l = {};
    for (let i in e)
      K(e, i) && (l[i] = ve(e[i]));
    t = l;
  }
  return x(e) && (t = ye(e, ve)), Ql(e) && (t = ue(ye(ze(Je(e)), ([l, i]) => [l, ve(i)]))), Jl(e) && (t = wi(ye(ze(e), ve))), t;
}, $ = (e, t, l) => e.includes(t, l), Je = (e) => G(e) ? _e[xi](e) : e[xi](), Ct = (e, t, l) => e.slice(t, l), d = (e) => e[Lr], bt = (e, t = 0) => setTimeout(e, t), Hf = (e) => {
  clearTimeout(e);
}, gl = (e, t) => {
  let l;
  return (...i) => {
    Hf(l), l = bt(() => e(...i), t);
  };
}, Yf = (e, t) => {
  let l = 0;
  return (...i) => {
    let r = Date.now();
    if (!(r - l < t))
      return l = r, e(...i);
  };
}, Gi = {}, zi = (e) => Ct(he("b" + [1e20], /[01]/g, () => crypto.getRandomValues(new Uint8Array(1))[0][zr](36)), 0, e), Rl = (e = 8) => {
  let t = zi(e);
  for (; t in Gi; ) t = zi(d(t) + 1);
  return Gi[t] = !0, t;
}, ns = (e, ...t) => console[e]("Brio.js", ...t), Se = (...e) => ns("warn", "warn:", fe, ...e), F = (...e) => ns(mi, `detected an ${mi}:`, fe, ...e), Ci = (e, t = dt) => ze(t.querySelectorAll(e)), ne = (e, t = dt) => L(e) ? Ci(e, t)[0] : e, Pe = (e, t, ...l) => e[t](...l), cs = (e) => e[qs](!0), Es = (e, t) => w(ze(e.attributes), ({ name: l, [m]: i }) => t(l, i)), yt = (e) => e[qe](), yl = (e) => e[ff], os = (e) => J(e[Rt] || ""), El = (e) => [...e.childNodes], Fe = (e, t) => e[tf](t), Be = (e, t) => e[sf](t), xl = (e, t, l, i) => {
  i && (e[i] = l), e[Tf](t, l);
}, ml = (e, t) => e[nf](t), Ts = (e, ...t) => e[qr].add(...t), kf = (e, ...t) => e[qr][qe](...t), Wi = requestAnimationFrame, St = (e) => Wi(() => Wi(e)), Zl = (e, t) => dt[Zs](e, t), gi = (e) => dt[Js](e), He = (e) => Ee(e.tagName || ""), Re = (e, t, l, i) => (e = ne(e), e[Vs](t, l, i), () => e[cf](t, l)), Ll = (e, t, l) => ne(e).dispatchEvent(new CustomEvent(Ee(he(t, /[^a-z\d]/gi, "")), {
  bubbles: !0,
  cancelable: !0,
  [$s]: l
})), Sl = async (e, t, l = !1) => {
  if (await t(e))
    for (let i of El(l && He(e) == se ? e[ci] : e))
      await Sl(i, t, l);
}, Gf = (e) => e[le][pl] = !0, zf = (e) => {
  let t = e[le];
  t[pl] && (t[pl] = !1, Ll(t, W));
}, Wf = (e) => Ye.getComputedStyle(e), Kf = (e) => {
  let t = Wf(e);
  return !(!yl(e) || t[Ms] == "none" || t.visibility == "hidden" || t.opacity == "0");
}, us = (e) => $(["src", m, et, V + "ed"], e), Vf = (e) => he(he(e, /[^\w-]/g, ""), /^[^a-z_]+/i, ""), Xf = (e) => {
  let t = {};
  for (let l of e)
    t[l] = e[lf](l), e[rf](l) == Al && (t[l] += " !" + Al);
  return t;
}, Nl = (e) => {
  let t = {}, l = {};
  for (let i in e)
    (is(i, ft) ? t : l)[i] = e[i];
  return [t, l];
}, Al = "important", qf = (e, t, l) => {
  let i = "";
  jl(l + "", "!" + Al) && (l = J(Ct(l, 0, -10)), i = Al), e[te][uf](t, l, i);
}, jf = (e, t) => {
  e[te][Ef](t);
}, Kt = (e, ...t) => {
  for (let l of t)
    for (let i in l)
      qf(e, i, l[i]);
}, Ol = (e, ...t) => {
  for (let l of t)
    for (let i in l)
      jf(e, i);
}, Ki = (e) => `only supports ${Te(Ct(e, 0, -1), ", ")}, and ${e[d(e) - 1]} insertions`, Qf = (e) => async (t, l, i, r) => {
  let f = dl + ":", a = l == Ae ? Rt : l, c = [qt, Tt, Kl, ol, Bt, Mt, Ae], s = () => ts(c, (M) => M == l);
  if (!s())
    return F(f, Ki(c));
  let n = ne(t);
  if (!nt(n))
    return F(f, le, X, it, ul);
  if (ne(oi) == n)
    return F(f, le, "cannot be the", Ti, Me);
  if (c = [Mt, Kl, ol], (ne(mr) == n || ne(xs) == n) && !s())
    return F(f, ls(He(n)), Me, Ki(c));
  i = await i;
  let E = e[se];
  i in E && (i = E[i]);
  let o = a == Rt, h = i, R = !1, P;
  if (!o && L(i) && (h = Zl("div"), h[Ut] = J(i), P = h.children[0], R = !0), !o && !nt(h))
    return F(f, ci, X, it, ul, "or", De);
  let N = Ce(r, of);
  if (!o && N && L(N)) {
    if (h = ne(N, h), !nt(h))
      return F(f, Me, Mr);
    Fe(h, Y + pt) && (P = h);
  }
  let { n: D, g: k } = e.bnode, U = k(n);
  if (U && P && !o) {
    let M = !0, _ = {}, B = {}, C = Fe(P, Y + pt);
    C && (B = U.exec(U, C)() || {});
    for (let S in B) {
      let y = B[S], T = y, u = !1, p = !1, O, I;
      if (G(y) && (T = y.type, u = !!y[cl], p = !!y.isText, O = y[vs], I = y.warn), T && L(T) && (T = [T]), !(x(T) && d(T) && zt(T, (H) => L(H)))) {
        Se(re(kt, "type for prop", S + ":", X, it, De, "or an array of strings."), n);
        continue;
      }
      T = ye(T, Ee);
      let A = Fe(n, S);
      if (Wt(A)) {
        u && (F("Missing required prop: " + S + ".", n), M = !1);
        continue;
      }
      if (ml(n, S), p && (A = Cl(A)), Ii(A) && (A = "()=>" + A), L(A) && (A = U.exec(U, A || "true")()), !$(T, we(A)) && !hl(O) && (A = me(O) && !$(T, Oi) ? O() : O), $(T, we(A)) || Se(re(kt, "prop type for", S + ":", X, it, Te(T, " or ") + ",", wl(we(A))), n), me(I)) {
        let H = I(A, S);
        H && Se(H, n);
      }
      _[S] = A;
    }
    M && ct(_) && (U.ctx[Vl] = _);
  }
  let Ie = e.gc[Jt];
  if (a == Bt) await Ie(n, !1);
  else if (o || a == Mt)
    for (let M of El(n)) await Ie(M, !1);
  let Z = R ? El(h) : [h];
  if (Pe(n, o ? Mt : a, ...Z), o && (Z = El(n)), w(Z, (M) => {
    let _ = [];
    He(M) == ae ? v(_, M) : Le(M) && v(_, ...Ci(ae, M)), w(_, (B) => {
      if (zt([Ai, Nr, Ar, Or], (C) => !Be(B, C))) {
        let C = Zl(ae);
        Es(B, (S, y) => xl(C, S, y, us(S) && S)), C[Ut] = B[Ut], Pe(B, Bt, C);
      }
    });
  }), Ce(r, Il, !0))
    for (let M of Z) {
      if (Le(M)) {
        let _ = D(M, n);
        await Ul(_);
      }
      await e.gc[Zt](M, n);
    }
  return Z;
}, kl = (e, t = "", l = "") => {
  let i = t == Qt ? FormData : URLSearchParams, r = new i(), f = (a, c = "") => {
    G(a) || x(a) ? w(Je(a), ([s, n]) => {
      let E = c ? `${c}[${s}]` : s;
      f(n, E);
    }) : r[ol](c, a);
  };
  return f(e, l), r;
}, mt = (e) => async (t, l, i = {}) => {
  let r = "status", f = Dr + "-Type", a = Ce(i, "parser");
  if (G(l)) {
    let c = i[Hi] || {}, s = es(Qe(c), (E) => Ee(E) == Ee(f)), n = Ee(c[s] || "");
    wt(c, s), e == Ke || e == z ? (t += kl(l), l = q) : jl(n, "json") ? (l = rs(l), c[f] = "application/json") : jl(n, "form-data") ? l = kl(l, Qt) : l = kl(l), i[Hi] = c;
  }
  try {
    let c = await fetch(t, { ...i, [Ys]: e, body: l }), s = await c[a || Ae]();
    if (!a)
      try {
        s = Di(s);
      } catch {
      }
    if (!c.ok) {
      let n = new Error(`HTTP ${c[r]}! Status text: ` + c.statusText);
      throw n.response = c, n[ci] = s, n;
    }
    return s;
  } catch (c) {
    throw c;
  }
}, bl = {
  get: mt(Ke),
  post: mt(zs),
  put: mt(Br),
  [Mi]: mt(Mi),
  [z]: mt(z)
}, Jf = (e) => vl(({ [b]: t, prop: l }) => (Vt(t)[Q].add(l), e)), ei = !1, ti = [], ps = (e) => (ti = [], ei = !0, e({}), ei = !1, [...ti]), hs = (e) => {
  let t = ps(e), l = d(t), [i, r] = t[l - 1] || [];
  return [i, r];
}, Ne = (e, t) => {
  if (!Vi(e) || At(e)) return e;
  let l = {
    get(a, c) {
      return ei && (K(a, c) || !(c in a)) && v(ti, [i, c]), xt.get(a, c, i);
    },
    set(a, c, s) {
      c in a || j(a, c, q, "wce");
      let n = i[c];
      if (n === s) return !0;
      let E = Vt(i), o = {
        [le]: a,
        [b]: i,
        prop: c,
        [vt]: n
        // [NEW_VALUE]: newValue,
        // [OPERATION]: UNDEFINED,
      };
      di(o, "e"), Ft.has(s) && (Ft[z](s), s = s(o));
      const h = x(s) && x(n) || G(s) && G(n);
      h && Et(n, s), !r.has(c) && !h && (s = Ne(s)), o[st] = h ? n : s, Zf(o);
      let R = h ? !0 : xt.set(a, c, s, i);
      return Xi(E, o), R;
    },
    [Bi](a, c) {
      let s = a[c], n = xt[Bi](a, c);
      return Xi(Vt(i), {
        [le]: a,
        [b]: i,
        prop: c,
        [vt]: s,
        [st]: q,
        [pi]: z
      }), n;
    },
    [Xl](a, c, s) {
      let n = s[m], E = i[c];
      return Ft.has(n) && (s[m] = n({ [b]: i, prop: c, [st]: n, [vt]: E })), !r.has(c) && m in s && (s[m] = Ne(s[m])), xt[Xl](a, c, s);
    }
  };
  const i = new Proxy(At(t) ? Mf(t, e) : e, l), r = wi();
  let f = {
    // [PARENT]: parent,
    // [TARGET]: target,
    // proxied,
    [b]: ue(),
    [pt]: {},
    skip: r
    // refs: [],
    // [ON_SET]: {},
  };
  $l.set(i, f);
  for (let a in e) {
    let c = e[a];
    Ft.has(c) && (c = c({
      [le]: e,
      [b]: i,
      prop: a,
      [vt]: q
    })), !r.has(a) && Vi(c) && xt.set(e, a, c, i);
  }
  return i;
}, Vi = (e) => x(e) || G(e), Xi = (e, t) => {
  let l = ue(), i = e[pt][t.prop];
  i && w(i, (f, a) => l.set(a, f)), w(e[b], (f, a) => l.set(a, f));
  let r = ze(l);
  Of(r, Pf);
  for (let [f] of r) f(t);
}, Zf = (e) => {
  e[pi] = hl(e[vt]) ? jt : hl(e[st]) ? z : Kr;
}, Nt = (e, t, l = 0) => {
  let i = [], r = ps(t || e);
  return w(r, ([f, a]) => {
    v(i, As(f, a, e, l));
  }), t && e({}), () => w(i, (f) => f());
}, Ht = (e, t, l, i = 0) => {
  let r;
  return At(e) ? L(t) || Oe(t) ? r = As(e, t, l, i) : r = Ns(e, l, i) : (F(ms + `watch non-${b} ${It}/${ut}.`), r = () => {
  }), r;
}, Rs = "getItem", ys = "setItem", li = ue(), bf = (e) => {
  let t = Uf(e);
  return t && K(t, Rs) && K(t, ys);
}, ii = (e, t) => Di(e[Rs](t) || ""), qi = (e, t, l) => e[ys](t, rs(l)), ji = (e) => "_b_" + e, Ss = (e, t, l) => bf(e) ? (l && (l = ji(l), K(e, l) && (t = ii(e, l))), vl(({ [b]: r, prop: f }) => (li.set(l, [r, f, e]), l = l || ji(f), K(e, l) ? t = ii(e, l) : qi(e, l, t), bt(() => Ht(r, f, () => {
  qi(e, l, r[f]);
})), t))) : F(kt, Ri, It), ea = (e, t) => Ss(localStorage, e, t), ta = (e, t) => Ss(sessionStorage, e, t), la = (e) => {
  if (li.has(e.key)) {
    let [t, l, i] = li.get(e.key);
    i === e[hf] && (t[l] = ii(i, e.key));
  }
}, ia = (e) => vl(({ [b]: t, prop: l }) => (Nt(() => t[l] = e(), e), e())), $l = ue(), Ft = wi(), vl = (e) => Ft.add(e) && e, At = (e) => $l.has(e), Vt = (e) => $l.get(e), ri = (e) => $l[z](e), Ns = (e, t, l = 0) => {
  if (At(e)) {
    let i = Vt(e)[b];
    return i.set(t, l), () => i[z](t);
  }
}, As = (e, t, l, i = 0) => {
  let r = Vt(e)[pt];
  r[t] || (r[t] = ue()), r[t].set(l, i);
  let f = e[t], a;
  return At(f) && (a = Ns(f, l, i)), () => {
    a && a(), r[t][z](l);
  };
};
j(Ne, "init", vl, "e");
j(Ne, Q, Jf, "e");
let Os = (e, t, l = !0) => new Function(e, l ? `return(${t})` : t), _s = (e, t = "", l = !0) => (Ii(e) || (e = Ml(e), e = `(${t})=>` + (l ? `(${e})` : `{${e}`)), e), ra = [rt, at, yr], Ps = (e, t) => {
  let l = If(t, /^\s*([a-z_$][\w$]*)/i);
  if (!l) return t;
  for (let i of ra) {
    let r = e.ctx[i];
    if (r && l[1] in r) {
      t = i + "." + t;
      break;
    }
  }
  return t;
}, el = (e, t) => "{" + Te(Pi(Qe(e), (l) => $(t, l)), ",") + "}", Qi = "matches", Ji = " characters long.", Zi = "\\p{L}", sa = "\\p{Nd}", fa = Bf(ki(ki("^(?!.*\\.{2})[w._%+-]+@(?:[w](?:[w-]*[w])?\\.)+[l]{2,}$", /w/, Zi + sa), /l/, Zi), "u"), aa = (e, t, l, i) => {
  let r = {};
  e || (e = {});
  let f = (s, n, E) => {
    let o = !1;
    return (L(s) || x(s)) && (o = E ? d(s) >= n : d(s) <= n), Oe(s) && (o = E ? s >= n : s <= n), o;
  }, a = {
    [cl]: (s) => !!s || s === 0,
    min: (s, n) => f(s, n, !0),
    max: (s, n) => f(s, n, !1),
    [nl]: (s) => L(s) && xe(s, fa),
    same: (s, n, E) => s === E[n],
    in: (s, n) => x(n) && $(n, s),
    [Qi]: (s, n) => L(s) && xe(s, n),
    type: (s, n) => a.in(we(s), x(n) ? n : [n]),
    // Note that custom rules can override default rules
    ...l || {}
  }, c = {
    // E.g. "Username is required.", "Age is required."
    [cl]: (s) => re(pe(s), "is", cl + "."),
    // E.g. "Username must be at least 3 characters long.", "Age must be at least 18."
    min: (s, n, E) => re(pe(s), X, "at least", n + (L(E[s]) ? Ji : ".")),
    // E.g. "Username must be at most 20 characters long.", "Age must be at most 65."
    max: (s, n, E) => re(pe(s), X, "at most", n + (L(E[s]) ? Ji : ".")),
    // E.g. "Email must be valid."
    [nl]: () => re(pe(nl), X, Si + "."),
    // E.g. "ConfirmPassword must be the same as the password."
    same: (s, n) => re(pe(s), X, "the same as the", pe(n) + "."),
    // E.g. "Status must be equal to active or pending."
    in: (s, n) => re(pe(s), X, "equal to", Te(n, " or ") + "."),
    // E.g. "Username is invalid."
    [Qi]: (s) => pe(s) + " is invalid.",
    // E.g. "Username must be of type string.", "Age must be of type number or string."
    type: (s, n) => re(pe(s), X, it, (x(n) ? Te(n, " or ") : n) + "."),
    // Note that custom messages can override default messages
    ...i || {}
  };
  for (let [s, n] of Je(t || {})) {
    let E = e[s];
    for (let { name: o, [m]: h, [vr]: R } of n) {
      let P = a[o];
      P ? P(E, h, e) || (r[s] || (r[s] = []), R ? v(r[s], R) : v(r[s], c[o](s, h, e) || s + " is invalid.")) : Se("Unknown rule: " + o);
    }
  }
  return !ct(r) || r;
}, na = (e) => {
  let t = (c, s) => {
    let n = !1;
    return c ? (e[c] = G(s) ? s : {}, n = !0) : Se("Step name is required."), n;
  }, l = (c) => e[c] && e[c].active, i = (c, s) => {
    let n = !1;
    if (l(c)) {
      let E = e[c], o = E[s];
      o && e[o] ? (l(o) || (e[o].active = !0), e[o].origin = c, n = !0, E.keep || (E.active = !1)) : Se(`Step "${c}" does not have a valid ${s} step to go to.`);
    }
    return n;
  };
  return [t, l, (c) => i(c, "next"), (c) => i(c, "back"), (c) => i(c, "origin")];
}, ca = Lf(sl), hn = () => {
  let e = (T) => o.get(T), t = (T, u = () => !0) => {
    let p = T ? yl(T) : Dl;
    for (; p; ) {
      let O = e(p);
      if (O && u(O)) return O;
      p = yl(p);
    }
  }, l = (T, u) => {
    let p = e(T);
    if (!p) {
      let O = u && e(u) || t(u || T);
      p = {
        // Local context
        // @ts-ignore
        ctx: { ...U },
        // A reference to the element. Convenience for internal use.
        el: T,
        [Gt]: O,
        // Unique ID context
        id: Ce(O, "id", {}),
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
        [Q]: 0,
        ...y
      };
      for (let I in D) {
        let A = D[I](p, O);
        A && j(p.ctx, I, A, "we");
      }
      o.set(T, p), p[oe] = ua(p, Y + oe)(p.ctx);
    }
    return p;
  }, i = async (T, u) => {
    L(T) && (T = ne(T)), L(u) && (u = ne(u)), nt(u) || (u = q), nt(T) && (await c(T), await Sl(T, async (p) => {
      let O = !1, I = T == p ? u : q;
      return xf(p) && os(p) ? O = f(p, I) : Le(p) && (He(p) == ae && !Be(p, Ai) ? O = !1 : O = await a(p, I)), O;
    }));
  }, r = async (T, u = !0, p = !0) => {
    await Sl(T, async (O) => {
      let I = e(O);
      if (I) {
        if (I[Ue])
          for (let A of I[Ue])
            await r(A, u, p);
        if (I[lt])
          for (let A of I[lt])
            await r(A, u, p);
        I.ph && yt(I.ph), w(I.cFns, (A) => A()), p && o[z](O);
      }
      return u && yt(O), !0;
    });
  }, f = (T, u) => {
    let p = T[Rt] || "";
    if (p && xe(p, pa)) {
      let O = l(T, u);
      p = Cl(p);
      let I = E(O, p, "", !0, !1);
      g(O, Nt(() => T[Rt] = I(O.ctx))), si(O, Ae, p);
    }
    return !1;
  }, a = async (T, u) => {
    let p = l(T, u);
    if ($e(p, 3)) return !0;
    for (let [O, I] of h) {
      let A = [];
      if (ss(O))
        Es(T, (H, tl) => {
          xe(H, O) && v(A, [H, tl]);
        });
      else {
        let H = Fe(T, O);
        Wt(H) || v(A, [O, H]);
      }
      for (let [H, tl] of A) {
        if ($e(p, 1) || $e(p, 3)) break;
        si(p, H, tl), await I(p, H, Ml(tl));
      }
      if ($e(p, 1) || $e(p, 3)) break;
    }
    return $e(p, 0) && (p[Q] = 1), !ct(p[ce]) && !u && o[z](T), !$e(p, 2) && !$e(p, 3);
  }, c = async (T) => {
    let u = await Is(T, Ar, []);
    w(u, ([p, O]) => {
      let I = He(O), A = I != ae && I != te ? se : I;
      I == se && !Be(O, ht) && xl(O, ht, "");
      let H = O[A == se ? Qr : Ut];
      y[A][p] = J(H);
    });
  }, s = (T) => (u, p) => {
    y[T][u] = p;
  }, n = (T, u, p = "", O = !0, I = !0) => {
    let A;
    return u = _s(I ? Ps(T, u) : u, p, O), u in N ? A = N[u] : (A = Rl(), P[A] = Os(el(T.ctx, u), u), N[u] = A), A;
  }, E = (T, u, p = "", O = !0, I = !0) => {
    let A;
    try {
      let H = u in P ? u : n(T, u, p, O, I);
      A = P[H](T.ctx);
    } catch (H) {
      F(
        H[vr]
        // '\nExpression:', exp, 
        // '\nElement:', bnode.el
      ), A = () => ca;
    }
    return A;
  }, o = ue(), h = [], R = {}, P = {}, N = {}, D = {
    // The $data context. Equivalent to creating a component.
    [at]: ha(at, Ge),
    // The $props context. Non-reactive properties passed to the element and its children as defined in the b-props directive schema.
    [Vl]: (T, u) => (u == null ? void 0 : u.ctx[Vl]) || {},
    // The $for context
    [rt]: (T, u) => u == null ? void 0 : u.ctx[rt],
    // Data Level Context:
    // Referenced under the same $data context, not including nested $data contexts
    [zl]: bi(zl),
    [Wl]: bi(Wl),
    // The element itself
    $el: (T) => T.el,
    // Unique identifier for the element
    $id: (T) => T.id,
    $cleanup: (T) => (u) => g(T, u)
  }, k = {
    [se]: s(se),
    [te]: s(te),
    [ae]: s(ae),
    data: s(Qt)
  }, U = {
    [yr]: Ne({}),
    $set: k,
    [Zt]: i,
    [Jt]: r
  }, Ie = Ne({}), [Z, M, _, B, C] = na(Ie), S = {
    http: bl,
    [b]: Ne,
    watch: Ht,
    effect: Nt,
    computed: ia,
    persist: ea,
    session: ta,
    steps: Ie,
    setStep: Z,
    isStepActive: M,
    nextStep: _,
    backStep: B,
    originStep: C,
    go: Ea,
    emit: Ll,
    listen: Re,
    /** Get the local context of an element */
    context: (T) => {
      var u;
      return (u = e(ne(T))) == null ? void 0 : u.ctx;
    },
    // Tools
    hasProp: K,
    getProp: Ce,
    setProp: j,
    sync: Et,
    [Ir]: ve,
    [Rf]: aa,
    uid: Rl,
    getType: we
  };
  w(Qe(S), (T) => U[Pt + T] = S[T]);
  let y = {
    [se]: R,
    [te]: {},
    [ae]: {},
    data: {},
    // ! HYDRATION
    [jr]: h,
    bnode: { n: l, g: e, a: o },
    // ! PUBLIC CONTEXT
    gc: U,
    exec: E
  };
  return U[dl] = Qf(y), w([k, bl, U, y], (T) => di(T, "e")), y;
}, Ea = (e) => {
  Oe(e) ? history.go(e) : mf.href = e;
}, $e = (e, t) => e[Q] == t, g = (e, t) => {
  v(e.cFns, t);
}, Ot = (e, t) => {
  let l = e[Gt];
  l && (l[lt] || (l[lt] = []), $(l[lt], t) || v(l[lt], t));
}, oa = (e) => es(_t(e), (t) => yl(t)), _t = (e) => {
  let t = [], { g: l } = e.bnode;
  return e.ph && v(t, e.ph), w(e[Ue] || [e.el], (i) => {
    let r = l(i);
    r && K(r.attr, ht) ? v(t, ..._t(r)) : v(t, i);
  }), t;
}, Ta = (e) => {
  w(_t(e), (t) => {
    t != e.ph && yt(t);
  });
}, ua = (e, t, l = {}) => {
  let i = () => l, r = Le(e.el) ? Fe(e.el, t) : null;
  return Wt(r) || si(e, t, r), r && J(r) && (r = Ml(r), i = e.exec(e, r, el(e.ctx, r))), i;
}, si = (e, t, l) => {
  e[ce][t] = l, Le(e.el) && ml(e.el, t);
}, Ml = (e) => he(Te(ye(ge(e, fe), (t) => is(J(t), "//") ? "" : t), fe), /;\s*$/, ""), pa = /\${((?!.*\${).*?)}/, ha = (e, t, l) => (i, r) => {
  let f = i.el, a = r ? r.ctx[e] : Dl, c = Le(f), s = c && Be(f, t), n = c && (i[ce][de] || Be(f, de)), E = c && (!a || s);
  return E && !s && t == Ge && xl(f, Ge, ""), E && !n ? Ne({}, l) : a || {};
}, bi = (e) => (t, l) => !l || Le(t.el) && Be(t.el, Ge) ? {} : l.ctx[e], Rn = (e = {}) => {
  sl in Ye || (di(e, "e"), j(Ye, sl, e, "e"), Re(Ye, Ri, la)), Ll(Ye, sl);
}, Fl = (e) => (e.match(/^(b-\w+|bind|on)(-([\w-$]+))?$/) || [])[3] || "", Ul = async (e) => {
  await er(e, Or), await er(e, ai);
}, er = async (e, t) => {
  let l = t == ai, i = e.ctx[l ? zl : Wl], r = l ? [
    /*B_IF,*/
    Sr,
    ht,
    Ge
  ] : [Ge];
  for (let f of e[Ue] || [e.el]) {
    let a = await Is(f, t, r);
    w(a, ([c, s]) => {
      i[c] = l ? s : s[Qr], g(e, () => wt(i, c));
    });
  }
}, Is = async (e, t, l) => {
  let i = [], r = t != ai;
  return await Sl(e, (f) => {
    if (Le(f)) {
      if (ts(l, (c) => Be(f, c))) return !1;
      let a = Fe(f, t);
      a && (ml(f, t), v(i, [a, f]), r && yt(f));
    }
    return !0;
  }, r), i;
}, gt = (e, t, l) => {
  let i = e.exec(e, t);
  g(e, Nt(() => l(i)));
}, Ds = (e, t, l) => {
  let i = [];
  return l && (l in t ? v(i, t[l]) : (l = e.exec(e, l)(), l in t ? v(i, t[l]) : x(l) && w(l, (r) => {
    r in t && v(i, t[r]);
  }))), i;
}, Ra = async (e, t) => {
  e[Q] = 3;
}, ya = [Nr, Ra], tr = /^[a-z_$][\w$]*$/i, Sa = (e, t, l) => {
  let i = e.el, { n: r, g: f } = e.bnode;
  e[Q] = 3;
  let [a, c] = ye(ge(l, " in "), J), [s, n] = ye(ge(a, ","), J);
  n || (n = Us);
  let E = re("the", t, We, _i);
  if (!xe(s, tr) || !xe(n, tr))
    return F(E, Ks, "alias.");
  let o = e.exec(e, c), [h, R] = hs(o), P = h ? h[R] : o(), N = h && At(P), D = !1;
  if (Oe(P) && (P = Ne(Yi(P, 1)), D = !0, h && Nt(() => {
    let _ = h[R] || 0;
    Oe(_) && Et(P, Yi(_, 1));
  }, () => h[R])), !(x(P) || G(P)))
    return F(E, `an ${ut}, ${It}, or ${ie}.`);
  e.ph = gi(t), Pe(i, Bt, e.ph), Ot(e, i);
  let k = {}, U = async ([_, B]) => {
    let C = cs(i);
    Pe(e.ph, qt, C);
    let S = r(C, i);
    S[ce][t] = "", K(e[ce], de) && (S[ce][de] = "");
    let y = Ne({}, S.ctx[rt]);
    j(y, s, B, "we"), j(y, n, _, "we"), j(S.ctx, rt, y, "we"), g(S, () => {
      ri(y);
    }), g(S, Ht(y, n, ({ [st]: T }) => {
      let u = k[_][1];
      T !== u && (y[n] = u);
    })), N && g(S, Ht(y, s, () => {
      P[y[n]] = y[s];
    })), k[_] = [C, _], await Ul(S), await e.gc[Zt](C, i);
  }, Ie = ([_, B]) => {
    let C = k[_], S = f(C && C[0]);
    if (S) {
      let y = S.ctx[rt];
      y[s] = B, y[n] = _, C[1] = _;
    }
  }, Z = ([_, B]) => {
    let [C] = k[_];
    e.gc[Jt](C), wt(k, _);
  }, M = {
    [jt]: U,
    [Kr]: Ie,
    [z]: Z
  };
  for (let _ of Je(P))
    U(_);
  h && g(e, Ht(P, q, ({ [pi]: _, prop: B, [st]: C }) => {
    M[_]([B, C]);
  })), g(e, () => {
    for (let _ in k)
      Z([Number(_), null]);
    D && ri(P);
  });
}, Na = [Sr, Sa], Aa = async (e, t, l) => {
  var f;
  let i = e.data[l];
  !me(i) && l && (i = e.exec(e, l, el(e.ctx, l) + ",$" + Gt));
  let r = me(i) ? await i(e.ctx, ((f = e[Gt]) == null ? void 0 : f.ctx[at]) || {}) : {};
  if (!G(r))
    return e[Q] = 3, F(Af(We, t, "an " + It, we(r)));
  for (let a in r) j(e.ctx[at], a, r[a], Ff(r, a));
  await Ul(e), g(e, () => {
    bt(() => {
      ri(e.ctx[at]);
    });
  });
}, Oa = [Ge, Aa], lr = {}, _a = async (e, t, l) => {
  if (l) {
    let i = e.exec(e, l)();
    if (!x(i) || !zt(i, L))
      return F("the", t, We, X, `an ${ut} of ${De}(s).`);
    e.id = i.reduce((r, f) => {
      let a = Rl(5);
      return lr[a] = !0, j(r, f, a, "e"), r;
    }, {}), g(e, () => {
      for (let r in e.id) wt(lr, e.id[r]);
    });
  }
}, Pa = ["b-id", _a], ds = (e) => (t, l, i) => {
  if (!(K(t[ce], ht) || K(t[ce], Vr) && e == Ae)) {
    let r = t[oe][l] || {};
    t[Q] = 2;
    let f = t[se];
    i in f && (i = Cl(i)), i && gt(t, i, async (a) => {
      await t.gc[dl](t.el, e, a(), r), t[Q] = 3;
    });
  }
}, Ia = [Vr, ds(Mt)], Da = [Xs, ds(Ae)], da = async (e, t, l) => {
  let i = e[oe][t] || {}, r = e.el, f = l ? e[se][l] || e.exec(e, l)() : r[Ut];
  e[Q] = 2, L(f) ? (e[Ue] = await e.gc[dl](r, qt, J(f), i), Ot(e, r), yt(r)) : Se(t + ":", kt, m, fe, f);
}, wa = [ht, da], Ca = async (e, t, l) => {
  let i = e.el;
  e[Q] = 2;
  let r = Ds(e, e[ae], l);
  if (He(i) == ae) {
    Ot(e, i);
    let f = Fe(i, "src"), a = f ? await bl.get(f) : os(i);
    a && v(r, a), yt(i);
  }
  for (let f of r) {
    if (L(f)) {
      let a = Ii(f);
      f = Os(el(e.ctx, f), Ml(f), a), a && (f = f(e.ctx));
    }
    me(f) && await f(e.ctx);
  }
}, ga = [Ai, Ca], xa = new RegExp("(?<=(?:^|})\\s*)\\S(?:.\\s*?)*?(?=\\s*{)", "g"), ma = (e, t, l) => {
  let i = e.el;
  if (l && He(i) != te) {
    let r = Ds(e, e[te], l), f = Rl();
    Ts(i, f), f = "." + f;
    let a = Zl(te);
    Pe(i, Tt, a);
    let c = Te(r, fe);
    c = he(c, /([{;])\s*/g, "$1" + fe + "    "), c = he(c, /\s*}\s*/g, fe + "}" + fe), a[Rt] = he(c, xa, (s) => {
      let n = J(s);
      return $(s, "&") ? n = he(n, /&/g, f) : n = Te(ye(ge(n, ","), (E) => f + " " + J(E)), "," + fe), n;
    }), e.gc[Zt](a, i), g(e, () => {
      e.gc[Jt](a);
    });
  }
}, La = [Y + te, ma], $a = (e, t, l) => {
  let i = l, r, f = e.ctx.$ref;
  i in f && (i = Cl(i)), gt(e, i, (a) => {
    i = a(), x(i) && ([i, r] = i), L(i) && i in f && (i = f[i]), $([qt, Tt, Kl, ol], r) || (r = Tt), nt(i) ? (Pe(i, r, ..._t(e)), Ot(e, e.el)) : Se(Gr, Me, Mr, t + `="${l}"`);
  });
}, va = [Y + Gr, $a], _l = ue(), Ma = (e, t, l) => {
  if (e[Ue]) return;
  if (!(K(e[ce], de) ? de : K(e[ce], fl) ? fl : ""))
    return F("the", t, We, X, "used with", de, "or", fl + ".");
  let r = e.exec(e, l)();
  x(r) || (r = [r]);
  let [f, a] = r;
  if (!G(f))
    return F("the", t, X, "an", It + ".");
  G(a) || (a = f);
  let c = Ua(e.el, f, a);
  _l.set(e.el, c), g(e, c[qe]), g(e, () => _l[z](e.el));
}, Fa = [Y + ft, Ma], ir = (e, t, l, i) => {
  let [r, f] = Nl(t), [a, c] = Nl(l);
  Ol(e, f, r, a), Kt(e, c, i ? { [ft]: "none" } : {}), St(() => {
    Kt(e, a), Ol(e, c);
  });
}, rr = (e, t, l) => {
  let [i, r] = Nl(t), [f, a] = Nl(l);
  Ol(e, r, i), Kt(e, a, f);
}, sr = () => (/* @__PURE__ */ new Date()).getTime(), Ua = (e, t, l) => {
  if (!Le(e))
    return F(kt, ft, Me, e);
  let i = null, r = 1, f = 2, a = 3, c = 4, s = r, n = Xf(e[te]), E = 0, o = Re(e, ft + "run", (D) => {
    D[le] === e && (E = sr());
  }), h, R = Re(e, ft + wr, (D) => {
    D[le] === e && (s == f ? s = c : s == a && (s = r), Ol(e, t, l), Kt(e, n), h && h());
  }), P = () => {
    o(), R();
  }, N = (D, k) => {
    h = k;
    let U = sr();
    D && i && s == c || !D && i === !1 && s == c || (D ? i === !1 && s == f ? (s = a, ir(e, t, l)) : (ir(e, l, t, s == r), i = !0, s = f) : i === null ? (i = !1, s = c, h && h()) : i && s == f ? (s = a, rr(e, l, t)) : (i = !1, s = f, rr(e, t, l)), bt(() => {
      E < U && h && h();
    }, 50));
  };
  return j(N, qe, P, "wce"), N;
}, Ba = (e, t, l) => {
  let i = e.el;
  e.ph = gi(t), Pe(i, Bt, e.ph), e[Q] = 3, Ot(e, i);
  let { n: r } = e.bnode, f, a, c = () => {
    e.gc[Jt](f.el), f = q;
  };
  gt(e, l, (s) => {
    let n = s();
    St(async () => {
      if (n) {
        if (!f) {
          let E = cs(i);
          Pe(e.ph, Tt, E), f = r(E, i), f[ce][de] = "", await Ul(f), await e.gc[Zt](E, i), Ot(e, E);
        }
        a = _l.get(f.el), a && a(!0);
      } else !n && f && (a ? a(!1, c) : c());
    });
  });
}, Ha = [de, Ba], Lt = ue(), Ya = (e, t, l) => {
  e.ph = gi(t), Pe(oa(e), qt, e.ph);
  let i, r = () => {
    Ta(e), Lt.set(e.ph, e);
  };
  gt(e, l, (f) => {
    let a = f();
    St(() => {
      let c = _t(e);
      if (i = _l.get(e.el), a) {
        if (Lt.has(e.ph)) {
          for (let s of c)
            if (Lt.has(s) && s !== e.ph) {
              let n = Lt.get(s), E = _t(n);
              c = Pi(c, (o) => !$(E, o) || o === n.ph);
            }
          Lt[z](e.ph), Pe(e.ph, Tt, ...c);
        }
        i && i(!0);
      } else i ? i(!1, r) : r();
    });
  });
}, ka = [fl, Ya], ll = (e, t, l) => {
  let i = Fl(t), [r] = ge(i, "-"), f = e[oe][t] || {}, a = e.exec(e, l, "$entry", !1), c = gl(a, f[Yt] || 100), s = new IntersectionObserver((n) => {
    w(n, (E) => {
      E.isIntersecting != (r == gr) && (c(E), f[ks] && s[Tl]());
    });
  }, f);
  s[ui](e.el), g(e, () => s[Tl]());
}, Ga = [
  [Li, ll],
  [Y + Li, ll],
  [$i, ll],
  [Y + $i, ll]
], fr = (e, t, l) => {
  let i = Fl(t);
  ge(i, "-");
  let r = e[oe][t] || {}, f = r[Ei] ? ne(oi) : e.el, a = e.exec(e, l, "$size", !1), c = gl(a, r[Yt] || 100), s = new ResizeObserver((n) => {
    let E = n[0].borderBoxSize[0];
    c([E.inlineSize, E.blockSize]);
  });
  s[ui](f, r), g(e, () => s[Tl]());
}, za = [
  [vi, fr],
  [Y + vi, fr]
], $t = "keyup", be = "keydown", ar = "outside", Wa = "window", ws = "control", fi = "meta", il = "arrow", nr = "repeat", Ka = [
  fi,
  ws,
  "shift",
  "alt"
], Va = {
  ctrl: ws,
  cmd: fi,
  [Ws]: fi,
  esc: "escape",
  del: z,
  up: il + "up",
  down: il + "down",
  left: il + "left",
  right: il + "right"
}, Xa = (e, t, l) => {
  let i = Fl(t), [r, ...f] = ge(i, "-"), a = e.el, c = a, s = e.exec(e, l, Pt + Fs), n = (N) => {
    let D = s(N);
    me(D) && D(N);
  }, E = e[oe][t] || {};
  w(f, (N) => {
    E[N] = !0;
  }), Yt in E && (n = gl(n, E[Yt])), Ui in E && (n = Yf(n, E[Ui])), E[ar] || E[Ei] ? c = dt : E[Wa] && (c = Ye);
  let o = {};
  $([be, $t], r) && w(Ce(E, "keys", []), (N) => {
    o[Ee(Va[N] || N)] = !0;
  });
  let h = (N) => {
    E[Fr] && N[af](), E.stop && N.stopPropagation(), !(E.self && N[le] !== N.currentTarget) && (E[ar] && (a.contains(N[le]) || !Kf(a)) || $([be, $t], r) && !(ct(o) == ct(R) && zt(Qe(o), (D) => R[D])) || n(N));
  }, R = {}, P = ct(o);
  $([be, $t], r) && P ? (g(e, Re(c, be, (N) => {
    if (E[nr] === !1 && N[nr]) return;
    let D = Ee(N.key);
    R[D] = !0, be == r && h(N), R.meta && !$(Ka, D) && Gl(N, R);
  })), g(e, Re(c, $t, (N) => {
    be == r && Gl(N, R), $t == r && (h(N), bt(() => Gl(N, R)));
  })), g(e, Re(c, "focus", () => {
    as(R);
  }))) : g(e, Re(c, r, h, E));
}, Gl = (e, t) => wt(t, Ee(e.key)), qa = [/^(b-on|on)-([\w-$]+)$/, Xa], ja = (e, t, l) => {
  let i = e.el, r = Fl(t), f = _s(Ps(e, l || df(r)), "$initial");
  r = Vf(r);
  let a = Fe(i, r), c = e[oe][t] || {};
  gt(e, f, (s) => {
    if (!s)
      return Se(l, ql, wl(t + `="${l}"`), fe, i);
    let n = s(a || ""), E = c.prop || us(r) && r;
    if (n || E)
      if (r == te && G(n))
        Kt(i, n);
      else if (r == Pr && G(n))
        for (let o in n)
          n[o] ? Ts(i, o) : kf(i, o);
      else
        xl(i, r, !E && n === !0 ? "" : n, E);
    else ml(i, r);
  });
}, Qa = [/^(b-bind|bind)-([\w-$]+)$/, ja], rl = ue(), Ja = (e, t, l) => {
  let i = re("the", t, We), r = V + "ed", f = t + `="${l}"`, a = e.el, c = He(a), s = a.type;
  if (!$([W, tt, V], c))
    return F(i, _r, W, `, ${tt}, and ${V} ${Me}s.`, f, a);
  let [n, E] = hs(e.exec(e, l));
  if (!n)
    return F(i, ql, f, a);
  let o = n[E], h, R = () => ze(c == V ? a[oe] : U()), P = e[oe][t] || {}, N = (S) => {
    let y = S[!Be(S, m) && k ? et : m], T = rl.get(S) || P;
    if (L(y) && (T.trim && (y = J(y)), !T.raw)) {
      let u = Di(y);
      (Oe(u) || Wt(u) || gf(u)) && (y = u);
    }
    return y;
  }, D = (S) => c == W && $(S, s), k = D([Ze, Fi]), U = () => Ci(W + `[type="${Ze}"][name="${a.name}"]`), Ie = () => D(Ze) && d(U()) > 1, Z = () => {
    let S = [
      [W, Ze, [ie, De, al, ut]],
      [W, Fi, [ie, De, al]],
      [W, ie, [ie]],
      [W, "range", [ie]],
      [W, "", [ie, De]],
      [tt, "", [ie, De]],
      [V, "", [ie, De, al, ut]]
    ];
    for (let [y, T, u] of S)
      if (c == y && (!T || s == T)) {
        Wt(o) || hl(o) || $(u, we(o)) || Se(i, ql, it, Te(u, " or "), `for ${c == W ? s + " " : ""}${y} ${Me}s,`, wl(we(o)), f, a);
        break;
      }
  };
  St(() => {
    Z(), V == c ? w(R(), (S) => rl.set(S, P)) : D(Ze) && rl.set(a, P);
  });
  let M = () => {
    if (o = n[E], h = N(a), $([W, tt], c))
      if (s == Ze && x(o))
        a[et] = $(o, h);
      else if (k)
        a[et] = o === h;
      else {
        if (a[pl] || dt.activeElement === a && o === h) return;
        o !== h && (a[m] = o);
      }
    else c == V && (x(o) ? w(R(), (S) => {
      S[r] = $(o, N(S));
    }) : a[m] = o);
  };
  St(() => g(e, Nt(M)));
  let _ = {}, B = () => {
    if (o = n[E], c == V && a.multiple || Ie()) {
      let S = [];
      w(R(), (y) => {
        c == V && rl.set(y, P), (y[r] || y[et]) && v(S, N(y));
      }), n[E] = S;
    } else n[E] = k && !a[et] ? !1 : N(a);
  };
  (D([Ae, "search", "url", "tel", nl, "password"]) || c == tt) && (_[js] = Gf, _[Qs] = zf);
  let C = P.lazy || k || c == V ? "change" : W;
  _[C] = B;
  for (let [S, y] of Je(_))
    g(e, Re(a, S, y));
}, Za = ["b-model", Ja], ee = "output", ke = "cursor", ot = ke + "Updated", ba = "updateCursor", en = (e, t, l) => {
  let i = e.el;
  if (!(m in i && Yl in i))
    return F("the", t, We, _r, tt, Me + "s and textual", W, "types (text, email, etc.).");
  let r = {
    char: Bl,
    letter: an,
    [ie]: Cs,
    alpha: nn,
    money: sn
  }, f = {
    exp: () => {
    },
    [m]: "",
    [ke]: i[Yl],
    [ba]: Xt,
    [ot]: !1,
    [ee]: "",
    ...r
  };
  f.exp = e.exec(e, l, el(r, l));
  let a = () => {
    f[m] = i[m], f[m] != f[ee] && (f[ke] = i[Yl], tn(f), i[m] = f[ee], i.setSelectionRange(f[ke], f[ke]), Ll(i, $r, f));
  };
  St(a), g(e, Re(i, W, a, !0));
}, tn = (e) => {
  e[ot] = !1, e[ee] = "";
  let t = e.exp(e);
  if (me(t)) {
    t(e);
    return;
  }
  let l = e[m], i = 0, r = d(l);
  w([...t], (f, a) => {
    L(f) && d(f) > 1 && t.splice(a, 1, ...ge(f, ""));
  });
  for (let [f, a] of Je(t)) {
    if (i >= r) break;
    if (x(a)) {
      let c = 0, [s, n, E] = a;
      for (; i < r && c < E; ) {
        if (s(l[i]))
          c++, e[ee] += l[i];
        else {
          let o = !1, h, R = f;
          for (; R > -1 && (h = ln(t, R + 1)); ) {
            if (rn(h, l, i)) {
              o = !0;
              break;
            }
            R = _f(t, h, R);
          }
          if (o && c >= n) break;
        }
        i++, Xt(e, i);
      }
    } else L(a) && (e[ee] += a, l[i] == a && i++, Xt(e, i));
  }
}, ln = (e, t) => {
  for (let l = t; l < d(e); l++) {
    let i = e[l];
    if (x(i))
      return i;
  }
}, rn = (e, t, l) => {
  let i = !1;
  if (x(e)) {
    let [r, f, a] = e;
    if (me(r) && Oe(f) && Oe(a)) {
      let c = 0, s = d(t);
      for (let n = l; n < s && c < a; n++)
        r(t[n]) && c++;
      i = c > 0 && c >= f;
    }
  }
  return i;
}, sn = (e = {}) => (t) => {
  let l = t[m], i = d(l), r = Ce(e, "thousands", ","), f = Ce(e, "decimal", "."), a = Ce(e, "precision", 2);
  f == "," && (r = "."), r == "." && (f = ",");
  let c = !1, s = !1, n = [], E = [], [o] = Cs();
  for (let R = 0; R < i; R++)
    l[R] == "-" ? !d(n) && !d(E) && (c = !0) : s ? d(E) < a && o(l[R]) && v(E, R) : l[R] == f ? s = !0 : o(l[R]) && (d(n) == 1 && l[n[0]] == "0" ? n[0] = R : v(n, R));
  t[ee] = c ? "-" : "";
  let h = d(n);
  t[ot] = !1;
  for (let R = 0; R < h; R++)
    R > 0 && (h - R) % 3 == 0 && (t[ee] += r), t[ee] += l[n[R]], Xt(t, n[R] + 1);
  t[ee] += s ? f : "";
  for (let R = 0; R < d(E); R++)
    t[ee] += l[E[R]], Xt(t, E[R] + 1);
  return t;
}, Xt = (e, t) => {
  if (!e[ot]) {
    let l = e[ke];
    l == 0 ? e[ot] = !0 : l <= t && (e[ot] = !0, e[ke] = d(e[ee]));
  }
}, fn = (e = 1, t = 1) => (e = Oe(e) && e >= 0 ? e : 1, t = Oe(t) && t > e ? t : e > 0 ? e : 1, [e, t]), Bl = (e, t, l) => ss(e) || x(e) && zt(e, (r) => L(r) && d(r) == 1) ? [x(e) ? (r) => $(e, r) : (r) => xe(r, e), ...fn(t, l)] : F("Invalid mask character definition. Expected an array of characters or a regular expression."), an = (e, t) => Bl(new RegExp("\\p{L}", "u"), e, t), Cs = (e, t) => Bl(new RegExp("\\p{Nd}", "u"), e, t), nn = (e, t) => Bl(/[\p{L}\p{Nd}]/u, e, t), cn = [Y + $r, en], En = async (e, t, l) => {
  gt(e, l, (i) => {
    let r = i();
    me(r) && r();
  });
}, on = ["b-effect", En], Hl = (e, t, l) => (i, r, f) => {
  let a = i[oe][r] || {}, c = {
    [e]: !0
  };
  t.subtree = !1;
  for (let o in t)
    c[o] = a[o] || t[o];
  let s = i.exec(i, f, "$mutations", !1), n = gl(s, a[Yt] || 100), E = new MutationObserver((o) => {
    o = Tn(e, l, o), d(o) && n(o);
  });
  E[ui](a[le] || i.el, c), g(i, () => E[Tl]());
}, Tn = (e, t, l) => Pi(l, (i) => i.type === e && t(i)), cr = Hl(
  "childList",
  {},
  (e) => d(e.addedNodes)
), Er = Hl(
  "childList",
  {},
  (e) => d(e.removedNodes)
), or = Hl(
  "attributes",
  { attributeOldValue: !0, attributeFilter: q },
  () => !0
), Tr = Hl(
  "characterData",
  { characterDataOldValue: !0 },
  () => !0
), ur = Ve + "added" + Ue, pr = Ve + "removed" + Ue, hr = Ve + "attrs", Rr = Ve + "text", un = [
  [ur, cr],
  [Y + ur, cr],
  [pr, Er],
  [Y + pr, Er],
  [hr, or],
  [Y + hr, or],
  [Rr, Tr],
  [Y + Rr, Tr]
], pn = [
  /**
   * The b-ignore directive is used to stop the hydration of the element and its children.
   */
  ya,
  /**
   * Conditional hydration
   * Notes:
   * - b-if stops the hydration flow of the element and starts a new hydration flow with a copy of the element whenever the condition evaluates to true
   * - the original element is replaced with a placeholder comment node to hold its location in the DOM
   * - whenever the condition evaluates to false, the copy of the element is dehydrated and removed from the DOM
   */
  Ha,
  /**
   * Data context
   * Notes:
   * - the order of inference is: $for, $data, $props, $store
   * - b-slot and b-ref are hydrated after b-data
   */
  Oa,
  /** List rendering
   * Notes:
   * - b-for stops the hydration flow of the element and starts a new hydration flow for each item it creates
   */
  Na,
  /**
   * Unique ID generator
   */
  Pa,
  /**
   * Run one or more scripts on the element, right after the context ($props, $data, $slot, $ref, $for, $id) is set up.
   * Notes:
   * - the b-script directive may hold one script or an array of scripts
   * - the script(s) are executed in order and awaited
   * - when b-script is in a script element the content of the src file or text content is added to the list of scripts to be executed
   */
  ga,
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
  wa,
  /**
   * Conditional display
   * Notes:
   * - the element is hydrated regardless of the condition
   * - the b-show directive toggles the `display` of the element based on the condition
   */
  ka,
  // ['b-boost', hydrateBoost],
  Fa,
  // b-transition, b-transition-play, b-transition-reverse
  /**
   * The b-teleport moves the element to a different location in the DOM.
   * Notes:
   * - b-teleport also works with the b-if and b-template directives
   */
  va,
  /**
   * Dynamic hydration of HTML or text content and styles
   * Notes:
   * - if the element has a b-html and b-text directive, the b-html directive is hydrated and the b-text directive is ignored
   * - b-style always hydrates regardless of the b-html and b-text directives
   */
  Ia,
  Da,
  /**
   * Dynamic insertion of styles
   * Notes:
   * - the style element is inserted after the element that contains the b-style directive
   */
  La,
  /**
   * Data binding directives
   * Used to bind data to an element's property or attribute
   * 
   * - The `b-bind-|bind-` directive is a general directive used to bind data to an element property or attribute
   * - The `b-model` directive is used to create a two-way data binding between an input value and a reactive property
   * - The `b-mask` directive is used to format an input value using a mask
   */
  Qa,
  // [b-bind|bind]-[attributeName]
  Za,
  cn,
  /**
   * Event directives
   */
  ...Ga,
  // [b-on|on]-[enter|exit]
  ...un,
  // [b-on|on]-[addednodes|removednodes|attrs|text]
  ...za,
  // [b-on|on]-[resize]
  qa,
  // [b-on|on]-[eventName]
  /**
   * b-effect: used to create an effect that run when its dependencies change.
   * It is perfect for small expressions, reactive or not.
   * Example: console.log(`Hello, ${$data.name}!`)
   */
  on
], yn = (e) => {
  w(pn, (t) => v(e[jr], t));
};
export {
  Qa as bindDirective,
  Oa as dataDirective,
  on as effectDirective,
  Na as forDirective,
  Ia as htmlDirective,
  Pa as idDirective,
  Ha as ifDirective,
  ya as ignoreDirective,
  Ga as intersectionDirectives,
  cn as maskDirective,
  Za as modelDirective,
  un as mutationDirectives,
  hn as newApp,
  qa as onDirective,
  za as resizeDirectives,
  ga as scriptDirective,
  yn as setAllDirectives,
  Rn as setup,
  ka as showDirective,
  La as styleDirective,
  va as teleportDirective,
  wa as templateDirective,
  Da as textDirective,
  Fa as transitionDirective
};
//# sourceMappingURL=briojs.3.0.0.js.map
