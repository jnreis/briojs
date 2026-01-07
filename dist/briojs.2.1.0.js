let el = "brio", Nt = "$", et = "$for", Yl = "$ref", kl = "$slot", ur = "$store", at = "after", fl = "append", nt = "array", fe = "attr", Ol = "Attribute", U = "b-", hr = "b-for", ye = "b-if", pr = "b-ignore", si = "b-ref", Rr = "b-save", tl = "b-show", yr = "b-slot", Vt = "before", Is = "body", ll = "boolean", Nr = "can only be used on", ds = "Cannot ", je = "checkbox", Je = "checked", Ds = "Child", Ar = "class", Or = "clone", fi = "composi", ai = "content", _r = "Content", Wt = "create", Kt = "data", Ut = "debounce", Sr = "detail", Di = "default", Pr = "define", B = "delete", ke = "directive", al = "disconnect", Cs = "display", ni = "document", ge = "element", il = "email", wr = "end", Ci = "entries", gi = "error", gs = "event", Ir = "EventListener", dr = "exit", ze = "get", Dr = "has", Cr = "head", ci = "html", Ei = "HTML", _l = "hydrate", ms = "index", xs = "inner", Ls = "insert", Sl = "Invalid", gr = "length", mr = "mask", $s = "message", Ms = "method", le = "must be", ie = `
`, tt = "newValue", nl = "Node", me = "nodes", xr = "not found.", Pl = null, ee = "number", At = "object", oi = "observe", gt = "oldValue", Ge = "on-", mi = Ge + "enter", xi = Ge + dr, Li = Ge + "resize", Fs = "once", Ti = "operation", ae = "options", vs = "outer", Bt = "parent", $i = "patch", Us = "post", zl = "prepend", Lr = "prevent", $r = "Propert", Ve = $r + "y", Xt = "props", Mr = "put", Mi = "radio", We = "remove", ui = "replace", Fr = "require", re = "script", X = "skip", V = "select", q = "state", vr = "start", hi = "storage", De = "string", J = "style", Bs = "super", Ur = "teleport", te = "template", Te = "text", Fi = "throttle", pi = "tion", Br = "toString", lt = "transition", Hr = "type", b, Yr = "update", kr = "valid", m = "value", Ri = "With", zr = "a " + kr, Hs = "add" + Ir, it = Nt + Kt, jt = "$de" + _l, qt = Nt + _l, wl = Nt + Ls, cl = Nt + Xt, Be = U + Kt, Gr = U + ci, yi = U + re, ct = U + te, Ys = U + Te, Vr = Ds + "ren", Wr = Ar + "List", ks = Or + nl, El = fi + "ng", zs = fi + pi + vr, Gs = fi + pi + wr, Vs = Wt + "Comment", Ws = Wt + "Element", Gl = Pr + Ve, Ks = Pr + $r + "ies", be = "de" + _l + Vr, vi = B + Ve, Kr = ke + "s", Xs = "ends" + Ri, Ni = "func" + pi, js = ze + Ol, qs = ze + Ve + "Value", Qs = ze + Ve + "Priority", Js = Dr + Ol, Ui = Cr + "ers", Lt = xs + Ei, Y = "in" + Mr, $t = "of " + Hr, Xr = vs + Ei, jr = "Own" + Ve, Zs = Bt + nl, bs = Lr + "Default", qr = "proto" + Hr, ef = We + Ol, tf = We + Ir, lf = We + Ve, Mt = ui + Ri, mt = ui + Vr, Ai = Fr + "s", rl = Fr + "d", Ul = V + "ionStart", rf = V + "or", sf = "set" + Ol, ff = "set" + Ve, af = vr + "s" + Ri, nf = hi + "Area", Z = "tar" + ze, Ze = Te + "area", Et = Te + _r, cf = kr + "ate", Ef = "async" + Ni, Qr = ze + jr + "Descriptor", of = Qr + "s", Tf = Dr + jr, uf = (e, t, l, i) => `the ${e} ${t} ${Ai} ${l}, ` + Il(i), Il = (e) => `but got ${e} instead.`, Vl = Ai + " a reactive " + m, C = (e, ...t) => e.push(...t), hf = (e, t) => e.sort(t), ne = (e, t) => e.join(t), I = (e, t) => e.forEach(t), Ne = (e, t, l) => e.map(t, l), Oi = (e, t, l) => e.filter(t, l), Jr = (e, t, l) => e.find(t, l), _i = (e, t, l) => e.every(t, l), Zr = (e, t, l) => e.some(t, l), pf = (e, t, l) => e.indexOf(t, l), Rf = (e, t) => t[1] - e[1], He = (e) => Array.from(e), Bi = (e, t = 0) => Ne(He({ [gr]: e }), (l, i) => t + i), j = (e) => e.trim(), Ae = (e) => e.toLowerCase(), Se = (e, t, l) => e.split(t, l), br = (e) => e.toUpperCase(), yf = (e) => br(e[0]) + Pt(e, 1), Nf = (e) => Ae(e[0]) + Pt(e, 1), es = (e, t, l) => e[af](t, l), Wl = (e, t, l) => e[Xs](t, l), ue = (e, t) => t.test(e), W = (e, t, l) => e[ui](t, l), Kl = (e, t, l) => {
  for (; ue(e, t); )
    e = W(e, t, l);
  return e;
}, ts = (e) => ue(j(e), /^((async\s+)?function\s*\([^)]*\)\s*{[^}]*}|(async\s*)?(?:\([^()]*\)|[$\w]+)\s*=>)/), Af = (e) => Nf(ne(Ne(Se(e, "-"), yf), "")), ls = (e) => JSON.stringify(e), Si = (e, t) => {
  try {
    e = JSON.parse(e, t);
  } catch {
  }
  return e;
}, dl = (e) => "`" + e + "`", Ee = (...e) => ne(e, " "), xe = (e) => Ae(Pt(pe[qr][Br].call(e), 8, -1)), Ke = (e, t) => xe(e) === t, Ht = (e) => e === Pl, ol = (e) => e === b, k = (e) => Ke(e, At), $ = (e) => Ke(e, nt), Pe = (e) => Of(e) || _f(e), Of = (e) => Ke(e, Ni), _f = (e) => Ke(e, Ef), v = (e) => Ke(e, De), he = (e) => Ke(e, ee) && !isNaN(e), Sf = (e) => Ke(e, ll), Pf = (e) => Ot(e, is), Ot = (e, t) => e instanceof t, rt = (e) => Ot(e, Node), wf = (e) => Ot(e, Text), we = (e) => Ot(e, HTMLElement), Xl = (e) => Ot(e, Map), jl = (e) => Ot(e, Set), Fe = window, pe = Object, dt = Reflect, If = location, _t = Fe[ni], df = Symbol, is = RegExp, z = (e, t) => pe[qr][Tf].call(e, t), Oe = (e, t, l) => {
  let i = l;
  try {
    i = t in e ? e[t] : l;
  } catch {
  }
  return i;
}, St = (e, t) => delete e[t], Df = [
  ["w", "writable"],
  ["e", "enumerable"],
  ["c", "configurable"]
], K = (e, t, l = b, i = "") => {
  if (v(i)) {
    let r = i;
    i = { [m]: l }, I(Df, ([f, a]) => {
      i[a] = !x(r, f);
    });
  }
  pe[Gl](e, t, i);
}, st = (e) => d(_e(e)), _e = (e) => pe.keys(e), Cf = (e = Pl) => pe[Wt](e), gf = (e, t = {}) => {
  const l = Cf(e);
  return pe[Ks](
    l,
    pe[of](t)
  ), l;
}, mf = (e, t, l = pe) => l[Qr](e, t), xf = (e) => pe.getPrototypeOf(e), Pi = (e, t = {}) => {
  I(_e(e), (l) => {
    K(e, l, e[l], t);
  });
}, rs = (e) => I(_e(e), (t) => {
  St(e, t);
}), ce = (e = b) => new Map(e), ot = (e = b) => new Set(e), Lf = (e, t) => new is(e, t), Ft = (e, t) => {
  if (e === t) return e;
  if ($(e) && $(t)) {
    for (; d(e) > d(t); ) e.pop();
    for (let l = 0; l < d(t); l++)
      l < d(e) ? e[l] = Ft(e[l], t[l]) : e.push(Ce(t[l]));
  } else if (Xl(e) && Xl(t)) {
    let l = ce(e);
    e.clear();
    for (let [i, r] of Le(t))
      e.set(i, l.has(i) ? Ft(l.get(i), r) : Ce(r));
  } else if (jl(e) && jl(t)) {
    e.clear();
    for (let l of t)
      e.add(l);
  } else if (k(e) && k(t)) {
    let l = { ...e };
    rs(e);
    for (let i in t)
      z(t, i) && (e[i] = z(l, i) ? Ft(l[i], t[i]) : Ce(t[i]));
  } else
    return t;
  return e;
}, Ce = (e) => {
  let t = e;
  if (k(e)) {
    let l = {};
    for (let i in e)
      z(e, i) && (l[i] = Ce(e[i]));
    t = l;
  }
  return $(e) && (t = Ne(e, Ce)), Xl(e) && (t = ce(Ne(He(Le(e)), ([l, i]) => [l, Ce(i)]))), jl(e) && (t = ot(Ne(He(e), Ce))), t;
}, x = (e, t, l) => e.includes(t, l), Le = (e) => k(e) ? pe[Ci](e) : e[Ci](), Pt = (e, t, l) => e.slice(t, l), d = (e) => e[gr], Qt = (e, t = 0) => setTimeout(e, t), $f = (e) => {
  clearTimeout(e);
}, Yt = (e, t) => {
  let l;
  return (...i) => {
    $f(l), l = Qt(() => e(...i), t);
  };
}, Mf = (e, t) => {
  let l = 0;
  return (...i) => {
    let r = Date.now();
    if (!(r - l < t))
      return l = r, e(...i);
  };
}, Hi = {}, Yi = (e) => Pt(W("b" + [1e20], /[01]/g, () => crypto.getRandomValues(new Uint8Array(1))[0][Br](36)), 0, e), Tl = (e = 8) => {
  let t = Yi(e);
  for (; t in Hi; ) t = Yi(d(t) + 1);
  return Hi[t] = !0, t;
}, ss = (e, ...t) => console[e]("Brio.js", ...t), wt = (...e) => ss("warn", "warn:", ie, ...e), F = (...e) => ss(gi, `detected an ${gi}:`, ie, ...e), wi = (e, t = _t) => He(t.querySelectorAll(e)), se = (e, t = _t) => v(e) ? wi(e, t)[0] : e, Re = (e, t, ...l) => e[t](...l), fs = (e) => e[ks](!0), as = (e, t) => I(He(e.attributes), ({ name: l, [m]: i }) => t(l, i)), Tt = (e) => e[We](), ul = (e) => e[Zs], ns = (e) => j(e[Et] || ""), sl = (e) => [...e.childNodes], Ye = (e, t) => e[js](t), $e = (e, t) => e[Js](t), Dl = (e, t, l, i) => {
  i && (e[i] = l), e[sf](t, l);
}, Cl = (e, t) => e[ef](t), cs = (e, ...t) => e[Wr].add(...t), Ff = (e, ...t) => e[Wr][We](...t), ki = requestAnimationFrame, ut = (e) => ki(() => ki(e)), ql = (e, t) => _t[Ws](e, t), Ii = (e) => _t[Vs](e), Me = (e) => Ae(e.tagName || ""), oe = (e, t, l, i) => (e = se(e), e[Hs](t, l, i), () => e[tf](t, l)), Ue = (e, t, l) => se(e).dispatchEvent(new CustomEvent(Ae(W(t, /[^a-z\d]/gi, "")), {
  bubbles: !0,
  cancelable: !0,
  [Sr]: l
})), hl = async (e, t, l = !1) => {
  if (await t(e))
    for (let i of sl(l && Me(e) == te ? e[ai] : e))
      await hl(i, t, l);
}, vf = (e) => e[Z][El] = !0, Uf = (e) => {
  let t = e[Z];
  t[El] && (t[El] = !1, Ue(t, Y));
}, Bf = (e) => Fe.getComputedStyle(e), Hf = (e) => {
  let t = Bf(e);
  return !(!ul(e) || t[Cs] == "none" || t.visibility == "hidden" || t.opacity == "0");
}, Es = (e) => x(["src", m, Je, V + "ed"], e), Yf = (e) => W(W(e, /[^\w-]/g, ""), /^[^a-z_]+/i, ""), kf = (e) => {
  let t = {};
  for (let l of e)
    t[l] = e[qs](l), e[Qs](l) == Rl && (t[l] += " !" + Rl);
  return t;
}, pl = (e) => {
  let t = {}, l = {};
  for (let i in e)
    (es(i, lt) ? t : l)[i] = e[i];
  return [t, l];
}, Rl = "important", zf = (e, t, l) => {
  let i = "";
  Wl(l + "", "!" + Rl) && (l = j(Pt(l, 0, -10)), i = Rl), e[J][ff](t, l, i);
}, Gf = (e, t) => {
  e[J][lf](t);
}, kt = (e, ...t) => {
  for (let l of t)
    for (let i in l)
      zf(e, i, l[i]);
}, yl = (e, ...t) => {
  for (let l of t)
    for (let i in l)
      Gf(e, i);
}, Nl = (e, t, l = !0) => new Function(e, l ? `return(${t})` : t), os = (e, t = "", l = !0) => (ts(e) || (e = xl(e), e = `(${t})=>` + (l ? `(${e})` : `{${e}}`)), e), Vf = (e, t = ot()) => {
  let l = ot(e);
  for (let i = 128; i <= 1114111; i++) {
    if (i >= 55296 && i <= 57343) continue;
    let r = String.fromCodePoint(i);
    if (!l.has(r) && !t.has(r)) return r;
  }
}, Wf = (e) => {
  let t = [], l = ot();
  for (; ue(e, ii); ) {
    let i = Vf(e, l);
    if (!i) break;
    e = W(e, ii, (r, f) => (C(t, [i, f]), l.add(i), i));
  }
  return [e, t];
}, Kf = (e, t) => {
  for (let l = d(t) - 1; l >= 0; l--) {
    let [i, r] = t[l];
    e = W(e, i, "${" + r + "}");
  }
  return e;
}, zi = (e) => `only supports ${ne(Pt(e, 0, -1), ", ")}, and ${e[d(e) - 1]} insertions`, Xf = (e) => async (t, l, i, r) => {
  let f = wl + ":", a = l == Te ? Et : l, c = [Vt, at, zl, fl, Mt, mt, Te], s = () => Zr(c, (P) => P == l);
  if (!s())
    return F(f, zi(c));
  let n = se(t);
  if (!rt(n))
    return F(f, Z, le, $t, nl);
  if (se(ci) == n)
    return F(f, Z, "cannot be the", Ei, ge);
  if (c = [mt, zl, fl], (se(Cr) == n || se(Is) == n) && !s())
    return F(f, br(Me(n)), ge, zi(c));
  i = await i;
  let o = e[te];
  i in o && (i = o[i]);
  let u = a == Et, A = i, N = !1;
  if (!u && v(i) && (A = ql("div"), A[Lt] = j(i), N = !0), !u && !rt(A))
    return F(f, ai, le, $t, nl, "or", De);
  let _ = Oe(r, rf);
  if (!u && _ && v(_) && (A = se(_, A), !rt(A)))
    return F(f, ge, xr);
  let { n: O, g: w } = e.bnode, S = {};
  if (!u) {
    let P = {}, p = Ye(A.children[0], U + Xt);
    p && (P = Nl("", p)() || {});
    let E = [];
    for (let T in P) {
      let R = P[T], h = R, y = !1, D = !1, M;
      k(R) && (h = R.type, y = !!R[rl], D = !!R.isText, M = R.warn), $(h) || (h = [h]);
      let G = Ye(n, T);
      Cl(n, T), D && G && (G = dl(G)), v(G) && (G = Nl("", G || "true")());
      let di = Ht(G) || ol(G);
      if (x(h, xe(G)) || (y && di ? C(E, "Missing required prop: " + T + ".") : C(E, Ee(Sl, "prop type for", T + ":", le, $t, ne(h, " or ") + ",", Il(xe(G))))), Pe(M)) {
        let Xe = M(G, T);
        Xe && C(E, Xe);
      }
      if (di && Di in R) {
        let Xe = R[Di];
        G = Pe(Xe) && !x(h, Ni) ? Xe() : Xe;
      }
      S[T] = G;
    }
    I(E, (T) => wt(T, n));
  }
  if (st(S)) {
    let P = w(n);
    P.ctx[cl] = S;
  }
  let L = e.gc[jt];
  if (a == Mt) await L(n, !1);
  else if (u || a == mt)
    for (let P of sl(n)) await L(P, !1);
  let H = N ? sl(A) : [A];
  if (Re(n, u ? mt : a, ...H), u && (H = sl(n)), I(H, (P) => {
    let p = [];
    Me(P) == re ? C(p, P) : we(P) && C(p, ...wi(re, P)), I(p, (E) => {
      if (_i([yi, pr, Rr, yr], (T) => !$e(E, T))) {
        let T = ql(re);
        as(E, (R, h) => Dl(T, R, h, Es(R) && R)), T[Lt] = E[Lt], Re(E, Mt, T);
      }
    });
  }), Oe(r, _l, !0))
    for (let P of H) {
      if (we(P)) {
        let p = O(P, n);
        await $l(p);
      }
      await e.gc[qt](P, n);
    }
  return H;
}, Bl = (e, t = "", l = "") => {
  let i = t == Kt ? FormData : URLSearchParams, r = new i(), f = (a, c = "") => {
    k(a) || $(a) ? I(Le(a), ([s, n]) => {
      let o = c ? `${c}[${s}]` : s;
      f(n, o);
    }) : r[fl](c, a);
  };
  return f(e, l), r;
}, Dt = (e) => async (t, l, i = {}) => {
  let r = "status", f = _r + "-Type", a = Oe(i, "parser");
  if (k(l)) {
    let c = i[Ui] || {}, s = Jr(_e(c), (o) => Ae(o) == Ae(f)), n = Ae(c[s] || "");
    St(c, s), e == ze || e == B ? (t += Bl(l), l = b) : Wl(n, "json") ? (l = ls(l), c[f] = "application/json") : Wl(n, "form-data") ? l = Bl(l, Kt) : l = Bl(l), i[Ui] = c;
  }
  try {
    let c = await fetch(t, { ...i, [Ms]: e, body: l }), s = await c[a || Te]();
    if (!a)
      try {
        s = Si(s);
      } catch {
      }
    if (!c.ok) {
      let n = new Error(`HTTP ${c[r]}! Status text: ` + c.statusText);
      throw n.response = c, n[ai] = s, n;
    }
    return s;
  } catch (c) {
    throw c;
  }
}, Ql = {
  get: Dt(ze),
  post: Dt(Us),
  put: Dt(Mr),
  [$i]: Dt($i),
  [B]: Dt(B)
}, jf = (e) => ml(({ [q]: t, prop: l }) => (zt(t)[X].add(l), e)), Jl = !1, Zl = [], Ts = (e) => (Zl = [], Jl = !0, e({}), Jl = !1, [...Zl]), us = (e) => {
  let t = Ts(e), l = d(t), [i, r] = t[l - 1] || [];
  return [i, r];
}, Ie = (e, t) => {
  if (!Gi(e) || pt(e)) return e;
  let l = {
    get(a, c) {
      return Jl && (z(a, c) || !(c in a)) && C(Zl, [i, c]), dt.get(a, c, i);
    },
    set(a, c, s) {
      c in a || K(a, c);
      let n = i[c];
      if (n === s) return !0;
      let o = zt(i), u = {
        [Z]: a,
        [q]: i,
        prop: c,
        [gt]: n
        // [NEW_VALUE]: newValue,
        // [OPERATION]: UNDEFINED,
      };
      Pi(u, "wc"), xt.has(s) && (xt[B](s), s = s(u)), r.has(c) || (s = Ie(s)), u[tt] = s, qf(u);
      let A = dt.set(a, c, s, i);
      return Vi(o, u), A;
    },
    [vi](a, c) {
      let s = a[c], n = dt[vi](a, c);
      return Vi(zt(i), {
        [Z]: a,
        [q]: i,
        prop: c,
        [gt]: s,
        [tt]: b,
        [Ti]: B
      }), n;
    },
    [Gl](a, c, s) {
      let n = s[m], o = i[c];
      return xt.has(n) && (s[m] = n({ [q]: i, prop: c, [tt]: n, [gt]: o })), !r.has(c) && m in s && (s[m] = Ie(s[m])), dt[Gl](a, c, s);
    }
  };
  const i = new Proxy(pt(t) && k(t) ? gf(t, e) : e, l), r = ot();
  let f = {
    // [PARENT]: parent,
    // [TARGET]: target,
    // proxied,
    [q]: ce(),
    [Xt]: {},
    skip: r
    // refs: [],
    // [ON_SET]: {},
  };
  gl.set(i, f);
  for (let a in e) {
    let c = e[a];
    xt.has(c) && (c = c({
      [Z]: e,
      [q]: i,
      prop: a,
      [gt]: b
    })), !r.has(a) && Gi(c) && dt.set(e, a, c, i);
  }
  return i;
}, Gi = (e) => $(e) || k(e), Vi = (e, t) => {
  let l = ce(), i = e[Xt][t.prop];
  i && I(i, (f, a) => l.set(a, f)), I(e[q], (f, a) => l.set(a, f));
  let r = He(l);
  hf(r, Rf);
  for (let [f] of r) f(t);
}, qf = (e) => {
  e[Ti] = ol(e[gt]) ? Wt : ol(e[tt]) ? B : Yr;
}, ht = (e, t, l = 0) => {
  let i = [], r = Ts(t || e);
  return I(r, ([f, a]) => {
    C(i, Ns(f, a, e, l));
  }), t && e({}), () => I(i, (f) => f());
}, vt = (e, t, l, i = 0) => {
  let r;
  return pt(e) ? v(t) || he(t) ? r = Ns(e, t, l, i) : r = ys(e, l, i) : (F(ds + `watch non-${q} ${At}/${nt}.`), r = () => {
  }), r;
}, hs = "getItem", ps = "setItem", bl = ce(), Qf = (e) => {
  let t = xf(e);
  return t && z(t, hs) && z(t, ps);
}, ei = (e, t) => Si(e[hs](t) || ""), Wi = (e, t, l) => e[ps](t, ls(l)), Ki = (e) => "_b_" + e, Rs = (e, t, l) => Qf(e) ? (l && (l = Ki(l), z(e, l) && (t = ei(e, l))), ml(({ [q]: r, prop: f }) => (bl.set(l, [r, f, e]), l = l || Ki(f), z(e, l) ? t = ei(e, l) : Wi(e, l, t), Qt(() => vt(r, f, () => {
  Wi(e, l, r[f]);
})), t))) : F(Sl, hi, At), Jf = (e, t) => Rs(localStorage, e, t), Zf = (e, t) => Rs(sessionStorage, e, t), bf = (e) => {
  if (bl.has(e.key)) {
    let [t, l, i] = bl.get(e.key);
    i === e[nf] && (t[l] = ei(i, e.key));
  }
}, ea = (e) => ml(({ [q]: t, prop: l }) => (ht(() => t[l] = e(), e), e())), gl = ce(), xt = ot(), ml = (e) => xt.add(e) && e, pt = (e) => gl.has(e), zt = (e) => gl.get(e), ti = (e) => gl[B](e), ys = (e, t, l = 0) => {
  if (pt(e)) {
    let i = zt(e)[q];
    return i.set(t, l), () => i[B](t);
  }
}, Ns = (e, t, l, i = 0) => {
  let r = zt(e)[Xt];
  r[t] || (r[t] = ce()), r[t].set(l, i);
  let f = e[t], a;
  return pt(f) && (a = ys(f, l, i)), () => {
    a && a(), r[t][B](l);
  };
};
K(Ie, "init", ml, "wc");
K(Ie, X, jf, "wc");
let Xi = "matches", ji = "\\p{L}", ta = "\\p{Nd}", la = Lf(Kl(Kl("^(?!.*\\.{2})[w._%+-]+@(?:[w](?:[w-]*[w])?\\.)+[l]{2,}$", /w/, ji + ta), /l/, ji), "u"), ia = (e, t, l, i) => {
  let r = {};
  e || (e = {});
  let f = (s, n, o) => {
    let u = !1;
    return (v(s) || $(s)) && (u = o ? d(s) >= n : d(s) <= n), he(s) && (u = o ? s >= n : s <= n), u;
  }, a = {
    [rl]: (s) => !!s || s === 0,
    min: (s, n) => f(s, n, !0),
    max: (s, n) => f(s, n, !1),
    [il]: (s) => v(s) && ue(s, la),
    same: (s, n, o) => s === o[n],
    in: (s, n) => $(n) && x(n, s),
    [Xi]: (s, n) => v(s) && ue(s, n),
    type: (s, n) => a.in(xe(s), $(n) ? n : [n]),
    // Note that custom rules can override default rules
    ...l || {}
  }, c = {
    [rl]: (s) => Ee(s, "is", rl + "."),
    min: (s, n) => Ee(s, le, "at least", n + "."),
    max: (s, n) => Ee(s, le, "at most", n + "."),
    [il]: (s) => Ee(s, le, zr, il + "."),
    same: (s, n) => Ee(s, "must match", n + "."),
    in: (s, n) => Ee(s, le, "equal to", ne(n, " or ") + "."),
    [Xi]: (s) => s + " has an invalid format.",
    type: (s, n) => Ee(s, le, $t, ($(n) ? ne(n, " or ") : n) + "."),
    // Note that custom messages can override default messages
    ...i || {}
  };
  for (let [s, n] of Le(t || {})) {
    let o = e[s];
    for (let [u, [A, N]] of Le(n)) {
      let _ = a[u];
      _ ? _(o, A, e) || (r[s] || (r[s] = []), N ? C(r[s], N) : C(r[s], c[u](s, A, e) || s + " is invalid.")) : wt("Unknown rule: " + u);
    }
  }
  return !st(r) || r;
}, ra = df(el), un = () => {
  let e = (p) => u.get(p), t = (p, E = () => !0) => {
    let T = p ? ul(p) : Pl;
    for (; T; ) {
      let R = e(T);
      if (R && E(R)) return R;
      T = ul(T);
    }
  }, l = (p, E) => {
    let T = e(p);
    if (!T) {
      let R = E && e(E) || t(E || p);
      T = {
        // Local context
        // @ts-ignore
        ctx: { ...L },
        // A reference to the element. Convenience for internal use.
        el: p,
        [Bt]: R,
        // Unique ID context
        id: Oe(R, "id", {}),
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
        [X]: 0,
        ...P
      };
      for (let h in w) {
        let y = w[h](T, R);
        y && K(T.ctx, h, y, "c");
      }
      u.set(p, T), T[ae] = na(T, U + ae)(T.ctx);
    }
    return T;
  }, i = async (p, E) => {
    v(p) && (p = se(p)), v(E) && (E = se(E)), rt(E) || (E = b), rt(p) && (await c(p), await hl(p, async (T) => {
      let R = !1, h = p == T ? E : b;
      return wf(T) && ns(T) ? R = f(T, h) : we(T) && (Me(T) == re && !$e(T, yi) ? R = !1 : R = await a(T, h)), R;
    }));
  }, r = async (p, E = !0, T = !0) => {
    await hl(p, async (R) => {
      let h = e(R);
      if (h) {
        if (h[me])
          for (let y of h[me])
            await r(y, E, T);
        if (h[be])
          for (let y of h[be])
            await r(y, E, T);
        h.ph && Tt(h.ph), I(h.cFns, (y) => y()), T && u[B](R);
      }
      return E && Tt(R), !0;
    });
  }, f = (p, E) => {
    let T = p[Et], R = Ea(T || "");
    if (R && ue(R, ii)) {
      let h = l(p, E);
      R = ha(h, dl(R));
      let y = o(h, R, "", !0, !1);
      g(h, ht(() => p[Et] = y(h.ctx))), li(h, Te, T);
    }
    return !1;
  }, a = async (p, E) => {
    let T = l(p, E);
    if (de(T, 3)) return !0;
    for (let [R, h] of A) {
      let y = [];
      if (Pf(R))
        as(p, (D, M) => {
          ue(D, R) && C(y, [D, M]);
        });
      else {
        let D = Ye(p, R);
        Ht(D) || C(y, [R, D]);
      }
      for (let [D, M] of y) {
        if (de(T, 1) || de(T, 3)) break;
        li(T, D, M), await h(T, D, xl(M));
      }
      if (de(T, 1) || de(T, 3)) break;
    }
    return de(T, 0) && (T[X] = 1), st(T[fe]) || u[B](p), !de(T, 2) && !de(T, 3);
  }, c = async (p) => {
    let E = await As(p, Rr, []);
    I(E, ([T, R]) => {
      let h = Me(R), y = h != re && h != J ? te : h;
      h == te && !$e(R, ct) && Dl(R, ct, "");
      let D = R[y == te ? Xr : Lt];
      P[y][T] = j(D);
    });
  }, s = (p) => (E, T) => {
    P[p][E] = T;
  }, n = (p, E, T = "", R = !0, h = !0) => {
    let y;
    return E = os(h ? Os(p, E) : E, T, R), E in O ? y = O[E] : (y = Tl(), _[y] = Nl(Ml(p, E), E), O[E] = y), y;
  }, o = (p, E, T = "", R = !0, h = !0) => {
    let y;
    try {
      let D = E in _ ? E : n(p, E, T, R, h);
      y = _[D](p.ctx);
    } catch (D) {
      F(D[$s]), y = () => ra;
    }
    return y;
  }, u = ce(), A = [], N = {}, _ = {}, O = {}, w = {
    // The $data context
    [it]: oa(it, Be),
    // Reactive properties defined in the element or inherited from the parent context
    [cl]: (p, E) => (E == null ? void 0 : E.ctx[cl]) || {},
    // The $for context
    [et]: (p, E) => E == null ? void 0 : E.ctx[et],
    // Data Level Context:
    // Referenced under the same $data context, not including nested $data contexts
    [Yl]: qi(Yl),
    [kl]: qi(kl),
    // The element itself
    $el: (p) => p.el,
    // Unique identifier for the element
    $id: (p) => p.id,
    $cleanup: (p) => (E) => g(p, E)
  }, S = {
    [te]: s(te),
    [J]: s(J),
    [re]: s(re),
    data: s(Kt)
  }, L = {
    [ur]: Ie({}),
    $set: S,
    [qt]: i,
    [jt]: r
  }, H = {
    http: Ql,
    [q]: Ie,
    watch: vt,
    effect: ht,
    computed: ea,
    persist: Jf,
    session: Zf,
    go: sa,
    emit: Ue,
    listen: oe,
    /** Get the local context of an element */
    context: (p) => {
      var E;
      return (E = e(se(p))) == null ? void 0 : E.ctx;
    },
    // Tools
    hasProp: z,
    getProp: Oe,
    setProp: K,
    sync: Ft,
    [Or]: Ce,
    [cf]: ia,
    uid: Tl,
    getType: xe
  };
  I(_e(H), (p) => L[Nt + p] = H[p]);
  let P = {
    [te]: N,
    [J]: {},
    [re]: {},
    data: {},
    // ! HYDRATION
    [Kr]: A,
    bnode: { n: l, g: e, a: u },
    // ! PUBLIC CONTEXT
    gc: L,
    exec: o
  };
  return L[wl] = Xf(P), I([S, Ql, L, P], (p) => Pi(p, "wc")), P;
}, sa = (e) => {
  he(e) ? history.go(e) : If.href = e;
}, de = (e, t) => e[X] == t, g = (e, t) => {
  C(e.cFns, t);
}, Rt = (e, t) => {
  let l = e[Bt];
  l && (l[be] || (l[be] = []), x(l[be], t) || C(l[be], t));
}, fa = (e) => Jr(yt(e), (t) => ul(t)), yt = (e) => {
  let t = [], { g: l } = e.bnode;
  return e.ph && C(t, e.ph), I(e[me] || [e.el], (i) => {
    let r = l(i);
    r && z(r.attr, ct) ? C(t, ...yt(r)) : C(t, i);
  }), t;
}, aa = (e) => {
  I(yt(e), (t) => {
    t != e.ph && Tt(t);
  });
}, na = (e, t, l = {}) => {
  let i = () => l, r = we(e.el) ? Ye(e.el, t) : null;
  return Ht(r) || li(e, t, r), r && j(r) && (r = xl(r), i = e.exec(e, r, Ml(e, r))), i;
}, li = (e, t, l) => {
  e[fe][t] = l, we(e.el) && Cl(e.el, t);
}, xl = (e) => W(ne(Ne(Se(e, ie), (t) => es(j(t), "//") ? "" : t), ie), /;\s*$/, ""), ii = /\${((?!.*\${).*?)}/, ca = /{{((?!.*{{).*?)}}/, Ea = (e, t = "${$1}") => Kl(e, ca, t), oa = (e, t, l) => (i, r) => {
  let f = i.el, a = r ? r.ctx[e] : Pl, c = we(f), s = c && $e(f, t), n = c && (i[fe][ye] || $e(f, ye)), o = c && (!a || s);
  return o && !s && t == Be && Dl(f, Be, ""), o && !n ? Ie({}, l) : a || {};
}, qi = (e) => (t, l) => !l || we(t.el) && $e(t.el, Be) ? {} : l.ctx[e], hn = (e = {}) => {
  el in Fe || (Pi(e, "wc"), K(Fe, el, e, "wc"), oe(Fe, hi, bf)), Ue(Fe, el);
}, Ll = (e) => (e.match(/^(b-\w+|bind|on)(-([\w-$]+))?$/) || [])[3] || "", $l = async (e) => {
  await Qi(e, yr), await Qi(e, si);
}, Qi = async (e, t) => {
  let l = t == si, i = e.ctx[l ? Yl : kl], r = l ? [
    /*B_IF,*/
    hr,
    ct,
    Be
  ] : [Be];
  for (let f of e[me] || [e.el]) {
    let a = await As(f, t, r);
    I(a, ([c, s]) => {
      i[c] = l ? s : s[Xr], g(e, () => St(i, c));
    });
  }
}, As = async (e, t, l) => {
  let i = [], r = t != si;
  return await hl(e, (f) => {
    if (we(f)) {
      if (Zr(l, (c) => $e(f, c))) return !1;
      let a = Ye(f, t);
      a && (Cl(f, t), C(i, [a, f]), r && Tt(f));
    }
    return !0;
  }, r), i;
}, Ml = (e, t) => "{" + ne(Oi(_e(e.ctx), (l) => x(t, l)), ",") + "}", Ta = (e, t) => {
  for (let l of [et, it, cl, ur]) {
    let i = e.ctx[l];
    if (i && t in i) {
      t = l + "." + t;
      break;
    }
  }
  return t;
}, ua = new RegExp("(?<![.`'\"][\\w\\s$]*)[a-z_$][\\w$]*(?![\\w\\s$]*[:`'\"{])", "gi"), Os = (e, t) => W(t, ua, (l) => Ta(e, l)), ha = (e, t) => {
  let [l, i] = Wf(t);
  for (let r of i)
    r[1] = Os(e, r[1]);
  return Kf(l, i);
}, It = (e, t, l) => {
  let i = e.exec(e, t);
  g(e, ht(() => l(i)));
}, _s = (e, t, l) => {
  let i = [];
  return l && (l in t ? C(i, t[l]) : (l = e.exec(e, l)(), $(l) && I(l, (r) => {
    r in t && C(i, t[r]);
  }))), i;
}, pa = async (e, t) => {
  e[X] = 3;
}, Ra = [pr, pa], Ji = /^[a-z_$][\w$]*$/i, ya = (e, t, l) => {
  let i = e.el, { n: r, g: f } = e.bnode;
  e[X] = 3;
  let [a, c] = Ne(Se(l, " in "), j), [s, n] = Ne(Se(a, ","), j);
  n || (n = ms);
  let o = Ee("the", t, ke, Ai);
  if (!ue(s, Ji) || !ue(n, Ji))
    return F(o, zr, "alias.");
  let u = e.exec(e, c), [A, N] = us(u), _ = A ? A[N] : u(), O = A && pt(_), w = !1;
  if (he(_) && (_ = Ie(Bi(_, 1)), w = !0, A && ht(() => {
    let E = A[N] || 0;
    he(E) && Ft(_, Bi(E, 1));
  }, () => A[N])), !($(_) || k(_)))
    return F(o, `an ${nt}, ${At}, or ${ee}.`);
  e.ph = Ii(t), Re(i, Mt, e.ph), Rt(e, i);
  let S = {}, L = async ([E, T]) => {
    let R = fs(i);
    Re(e.ph, Vt, R);
    let h = r(R, i);
    h[fe][t] = "", z(e[fe], ye) && (h[fe][ye] = "");
    let y = Ie({}, h.ctx[et]);
    K(y, s, T, "c"), K(y, n, E, "c"), K(h.ctx, et, y, "c"), g(h, () => {
      ti(y);
    }), g(h, vt(y, n, ({ [tt]: D }) => {
      let M = S[E][1];
      D !== M && (y[n] = M);
    })), O && g(h, vt(y, s, () => {
      _[y[n]] = y[s];
    })), S[E] = [R, E], await $l(h), await e.gc[qt](R, i);
  }, H = ([E, T]) => {
    let R = S[E], h = f(R && R[0]);
    if (h) {
      let y = h.ctx[et];
      y[s] = T, y[n] = E, R[1] = E;
    }
  }, P = ([E, T]) => {
    let [R] = S[E];
    e.gc[jt](R), St(S, E);
  }, p = {
    [Wt]: L,
    [Yr]: H,
    [B]: P
  };
  for (let E of Le(_))
    L(E);
  A && g(e, vt(_, b, ({ [Ti]: E, prop: T, [tt]: R }) => {
    p[E]([T, R]);
  })), g(e, () => {
    for (let E in S)
      P([Number(E), null]);
    w && ti(_);
  });
}, Na = [hr, ya], Aa = async (e, t, l) => {
  var f;
  let i = e.data[l];
  !Pe(i) && l && (i = e.exec(e, l, Ml(e, l) + ",$" + Bt));
  let r = Pe(i) ? await i(e.ctx, ((f = e[Bt]) == null ? void 0 : f.ctx[it]) || {}) : {};
  if (!k(r))
    return e[X] = 3, F(uf(ke, t, "an " + At, xe(r)));
  for (let a in r) K(e.ctx[it], a, r[a], mf(r, a));
  await $l(e), g(e, () => {
    Qt(() => {
      ti(e.ctx[it]);
    });
  });
}, Oa = [Be, Aa], Zi = {}, _a = async (e, t, l) => {
  if (l) {
    let i = e.exec(e, l)();
    if (!$(i) || !_i(i, v))
      return F("the", t, ke, le, `an ${nt} of ${De}(s).`);
    e.id = i.reduce((r, f) => {
      let a = Tl(5);
      return Zi[a] = !0, K(r, f, a, "wc"), r;
    }, {}), g(e, () => {
      for (let r in e.id) St(Zi, e.id[r]);
    });
  }
}, Sa = ["b-id", _a], Ss = (e) => (t, l, i) => {
  if (!(z(t[fe], ct) || z(t[fe], Gr) && e == Te)) {
    let r = t[ae][l] || {};
    t[X] = 2;
    let f = t[te];
    i in f && (i = dl(i)), i && It(t, i, async (a) => {
      await t.gc[wl](t.el, e, a(), r), t[X] = 3;
    });
  }
}, Pa = [Gr, Ss(mt)], wa = [Ys, Ss(Te)], Ia = async (e, t, l) => {
  let i = e[ae][t] || {}, r = e.el, f = l ? e[te][l] || e.exec(e, l)() : r[Lt];
  e[X] = 2, v(f) ? (e[me] = await e.gc[wl](r, Vt, j(f), i), Rt(e, r), Tt(r)) : wt(t + ":", Sl, m, ie, f);
}, da = [ct, Ia], Da = async (e, t, l) => {
  let i = e.el;
  e[X] = 2;
  let r = _s(e, e[re], l);
  if (Me(i) == re) {
    Rt(e, i);
    let f = Ye(i, "src"), a = f ? await Ql.get(f) : ns(i);
    a && C(r, a), Tt(i);
  }
  for (let f of r) {
    if (v(f)) {
      let a = ts(f);
      f = Nl(Ml(e, f), xl(f), a), a && (f = f(e.ctx));
    }
    Pe(f) && await f(e.ctx);
  }
}, Ca = [yi, Da], ga = new RegExp("(?<=(?:^|})\\s*)\\S(?:.\\s*?)*?(?=\\s*{)", "g"), ma = (e, t, l) => {
  let i = e.el;
  if (l && Me(i) != J) {
    let r = _s(e, e[J], l), f = Tl();
    cs(i, f), f = "." + f;
    let a = ql(J);
    Re(i, at, a);
    let c = ne(r, ie);
    c = W(c, /([{;])\s*/g, "$1" + ie + "    "), c = W(c, /\s*}\s*/g, ie + "}" + ie), a[Et] = W(c, ga, (s) => {
      let n = j(s);
      return x(s, "&") ? n = W(n, /&/g, f) : n = ne(Ne(Se(n, ","), (o) => f + " " + j(o)), "," + ie), n;
    }), e.gc[qt](a, i), g(e, () => {
      e.gc[jt](a);
    });
  }
}, xa = [U + J, ma], La = (e, t, l) => {
  let i = l, r, f = e.ctx.$ref;
  i in f && (i = dl(i)), It(e, i, (a) => {
    i = a(), $(i) && ([i, r] = i), v(i) && i in f && (i = f[i]), x([Vt, at, zl, fl], r) || (r = at), rt(i) ? (Re(i, r, ...yt(e)), Rt(e, e.el)) : wt(Ur, ge, xr, t + `="${l}"`);
  });
}, $a = [U + Ur, La], Al = ce(), Ma = (e, t, l) => {
  if (e[me]) return;
  if (!(z(e[fe], ye) ? ye : z(e[fe], tl) ? tl : ""))
    return F("the", t, ke, le, "used with", ye, "or", tl + ".");
  let r = e.exec(e, l)();
  $(r) || (r = [r]);
  let [f, a] = r;
  if (!k(f))
    return F("the", t, le, "an", At + ".");
  k(a) || (a = f);
  let c = va(e.el, f, a);
  Al.set(e.el, c), g(e, c[We]), g(e, () => Al[B](e.el));
}, Fa = [U + lt, Ma], bi = (e, t, l, i) => {
  let [r, f] = pl(t), [a, c] = pl(l);
  yl(e, f, r, a), kt(e, c, i ? { [lt]: "none" } : {}), ut(() => {
    kt(e, a), yl(e, c);
  });
}, er = (e, t, l) => {
  let [i, r] = pl(t), [f, a] = pl(l);
  yl(e, r, i), kt(e, a, f);
}, tr = () => (/* @__PURE__ */ new Date()).getTime(), va = (e, t, l) => {
  if (!we(e))
    return F(Sl, lt, ge, e);
  let i = null, r = 1, f = 2, a = 3, c = 4, s = r, n = kf(e[J]), o = 0, u = oe(e, lt + "run", (w) => {
    w[Z] === e && (o = tr());
  }), A, N = oe(e, lt + wr, (w) => {
    w[Z] === e && (s == f ? s = c : s == a && (s = r), yl(e, t, l), kt(e, n), A && A());
  }), _ = () => {
    u(), N();
  }, O = (w, S) => {
    A = S;
    let L = tr();
    w && i && s == c || !w && i === !1 && s == c || (w ? i === !1 && s == f ? (s = a, bi(e, t, l)) : (bi(e, l, t, s == r), i = !0, s = f) : i === null ? (i = !1, s = c, A && A()) : i && s == f ? (s = a, er(e, l, t)) : (i = !1, s = f, er(e, t, l)), Qt(() => {
      o < L && A && A();
    }, 50));
  };
  return K(O, We, _), O;
}, Ua = (e, t, l) => {
  let i = e.el;
  e.ph = Ii(t), Re(i, Mt, e.ph), e[X] = 3, Rt(e, i);
  let { n: r } = e.bnode, f, a, c = () => {
    e.gc[jt](f.el), f = b;
  };
  It(e, l, (s) => {
    let n = s();
    ut(async () => {
      if (n) {
        if (!f) {
          let o = fs(i);
          Re(e.ph, at, o), f = r(o, i), f[fe][ye] = "", await $l(f), await e.gc[qt](o, i), Rt(e, o);
        }
        a = Al.get(f.el), a && a(!0);
      } else !n && f && (a ? a(!1, c) : c());
    });
  });
}, Ba = [ye, Ua], Ct = ce(), Ha = (e, t, l) => {
  e.ph = Ii(t), Re(fa(e), Vt, e.ph);
  let i, r = () => {
    aa(e), Ct.set(e.ph, e);
  };
  It(e, l, (f) => {
    let a = f();
    ut(() => {
      let c = yt(e);
      if (i = Al.get(e.el), a) {
        if (Ct.has(e.ph)) {
          for (let s of c)
            if (Ct.has(s) && s !== e.ph) {
              let n = Ct.get(s), o = yt(n);
              c = Oi(c, (u) => !x(o, u) || u === n.ph);
            }
          Ct[B](e.ph), Re(e.ph, at, ...c);
        }
        i && i(!0);
      } else i ? i(!1, r) : r();
    });
  });
}, Ya = [tl, Ha], Jt = (e, t, l) => {
  let i = Ll(t), [r] = Se(i, "-"), f = e[ae][t] || {}, a = e.exec(e, l, "$entry", !1), c = Yt(a, f[Ut] || 100), s = new IntersectionObserver((n) => {
    I(n, (o) => {
      o.isIntersecting != (r == dr) && (c(o), f[Fs] && s[al]());
    });
  }, f);
  s[oi](e.el), g(e, () => s[al]());
}, ka = [
  [mi, Jt],
  [U + mi, Jt],
  [xi, Jt],
  [U + xi, Jt]
], lr = (e, t, l) => {
  let i = Ll(t);
  Se(i, "-");
  let r = e[ae][t] || {}, f = r[ni] ? se(ci) : e.el, a = e.exec(e, l, "$size", !1), c = Yt(a, r[Ut] || 100), s = new ResizeObserver((n) => {
    let o = n[0].borderBoxSize[0];
    c([o.inlineSize, o.blockSize]);
  });
  s[oi](f, r), g(e, () => s[al]());
}, za = [
  [Li, lr],
  [U + Li, lr]
], qe = "keyup", Qe = "keydown", ir = "outside", Ga = "window", Ps = "control", ri = "meta", Zt = "arrow", rr = [
  ri,
  Ps,
  "shift",
  "alt",
  "fn"
], Va = {
  ctrl: Ps,
  cmd: ri,
  [Bs]: ri,
  esc: "escape",
  del: B,
  up: Zt + "up",
  down: Zt + "down",
  left: Zt + "left",
  right: Zt + "right"
}, Wa = (e, t, l) => {
  let i = Ll(t), [r, ...f] = Se(i, "-"), a = e.el, c = a, s = e.exec(e, l, Nt + gs), n = (O) => {
    let w = s(O);
    Pe(w) && w(O);
  }, o = e[ae][t] || {};
  I(f, (O) => {
    o[O] = !0;
  }), Ut in o && (n = Yt(n, o[Ut])), Fi in o && (n = Mf(n, o[Fi])), o[ir] || o[ni] ? c = _t : o[Ga] && (c = Fe);
  let u = {};
  x([Qe, qe], r) && I(Oe(o, "keys", []), (O) => {
    u[Va[O] || O] = !0;
  });
  let A = st(u), N = r;
  if (x([Qe, qe], r) && A) {
    let O = {};
    r = t;
    let w = Yt((S) => {
      Ue(c, r, S);
    }, 600);
    g(e, oe(c, Qe, (S) => {
      let L = Ae(S.key);
      O[L] || (O[L] = !0), Qt(() => {
        O.meta && !x(rr, L) && Hl(S, O);
      });
      let H = _e(O);
      A > 1 && qe == N && O.meta && !x(rr, L) ? w(H) : Qe == N && Ue(c, r, H);
    })), g(e, oe(c, qe, (S) => {
      Qe == N && Hl(S, O), Ue(c, r, _e(O)), qe == N && Hl(S, O);
    })), g(e, oe(c, "focus", () => {
      rs(O);
    }));
  }
  g(e, oe(c, r, (O) => {
    if (o[Lr] && O[bs](), o.stop && O.stopPropagation(), !(o.self && O[Z] !== O.currentTarget) && !(o[ir] && (a.contains(O[Z]) || !Hf(a)))) {
      if (x([Qe, qe], N)) {
        let w = O[Sr];
        if (!(st(u) == st(w) && _i(_e(u), (S) => x(w, S))))
          return;
      }
      n(O);
    }
  }, o));
}, Hl = (e, t) => St(t, Ae(e.key)), Ka = [/^(b-on|on)-([\w-$]+)$/, Wa], Xa = (e, t, l) => {
  let i = e.el, r = Ll(t), f = os(l || Af(r), "$initial");
  r = Yf(r);
  let a = Ye(i, r), c = e[ae][t] || {};
  It(e, f, (s) => {
    if (!s)
      return wt(l, Vl, Il(t + `="${l}"`), ie, i);
    let n = s(a || ""), o = c.prop || Es(r) && r;
    if (n || o)
      if (r == J && k(n))
        kt(i, n);
      else if (r == Ar && k(n))
        for (let u in n)
          n[u] ? cs(i, u) : Ff(i, u);
      else
        Dl(i, r, !o && n === !0 ? "" : n, o);
    else Cl(i, r);
  });
}, ja = [/^(b-bind|bind)-([\w-$]+)$/, Xa], bt = ce(), qa = (e, t, l) => {
  let i = Ee("the", t, ke), r = V + "ed", f = t + `="${l}"`, a = e.el, c = Me(a), s = a.type;
  if (!x([Y, Ze, V], c))
    return F(i, Nr, Y, `, ${Ze}, and ${V} ${ge}s.`, f, a);
  let [n, o] = us(e.exec(e, l));
  if (!n)
    return F(i, Vl, f, a);
  let u = n[o], A, N = () => He(c == V ? a[ae] : L()), _ = e[ae][t] || {}, O = (h) => {
    let y = h[!$e(h, m) && S ? Je : m], D = bt.get(h) || _;
    if (v(y) && (D.trim && (y = j(y)), !D.raw)) {
      let M = Si(y);
      (he(M) || Ht(M) || Sf(M)) && (y = M);
    }
    return y;
  }, w = (h) => c == Y && x(h, s), S = w([je, Mi]), L = () => wi(Y + `[type="${je}"][name="${a.name}"]`), H = () => w(je) && d(L()) > 1, P = () => {
    let h = [
      [Y, je, [ee, De, ll, nt]],
      [Y, Mi, [ee, De, ll]],
      [Y, ee, [ee]],
      [Y, "range", [ee]],
      [Y, "", [ee, De]],
      [Ze, "", [ee, De]],
      [V, "", [ee, De, ll, nt]]
    ];
    for (let [y, D, M] of h)
      if (c == y && (!D || s == D)) {
        Ht(u) || ol(u) || x(M, xe(u)) || wt(i, Vl, $t, ne(M, " or "), `for ${c == Y ? s + " " : ""}${y} ${ge}s,`, Il(xe(u)), f, a);
        break;
      }
  };
  ut(() => {
    P(), V == c ? I(N(), (h) => bt.set(h, _)) : w(je) && bt.set(a, _);
  });
  let p = () => {
    if (u = n[o], A = O(a), x([Y, Ze], c))
      if (s == je && $(u))
        a[Je] = x(u, A);
      else if (S)
        a[Je] = u === A;
      else {
        if (a[El] || _t.activeElement === a && u === A) return;
        u !== A && (a[m] = u);
      }
    else c == V && ($(u) ? I(N(), (h) => {
      h[r] = x(u, O(h));
    }) : a[m] = u);
  };
  ut(() => g(e, ht(p)));
  let E = {}, T = () => {
    if (u = n[o], c == V && a.multiple || H()) {
      let h = [];
      I(N(), (y) => {
        c == V && bt.set(y, _), (y[r] || y[Je]) && C(h, O(y));
      }), n[o] = h;
    } else n[o] = S && !a[Je] ? !1 : O(a);
  };
  (w([Te, "search", "url", "tel", il, "password"]) || c == Ze) && (E[zs] = vf, E[Gs] = Uf);
  let R = _.lazy || S || c == V ? "change" : Y;
  E[R] = T;
  for (let [h, y] of Le(E))
    g(e, oe(a, h, y));
}, Qa = ["b-model", qa], Q = "output", ve = "cursor", ft = ve + "Updated", Ja = "updateCursor", Za = (e, t, l) => {
  let i = e.el;
  if (!(m in i && Ul in i))
    return F("the", t, ke, Nr, Ze, ge + "s and textual", Y, "types (text, email, etc.).");
  let r = {
    exp: e.exec(e, l, "$mask"),
    [m]: "",
    [ve]: i[Ul],
    [Ja]: Gt,
    [ft]: !1,
    [Q]: "",
    char: Fl,
    letter: sn,
    [ee]: ws,
    alpha: fn,
    money: ln
  }, f = () => {
    r[m] = i[m], r[m] != r[Q] && (r[ve] = i[Ul], ba(r), i[m] = r[Q], i.setSelectionRange(r[ve], r[ve]), Ue(i, mr, r));
  };
  ut(f), g(e, oe(i, Y, f, !0));
}, ba = (e) => {
  e[ft] = !1, e[Q] = "";
  let t = e.exp(e);
  if (Pe(t)) {
    t(e);
    return;
  }
  let l = e[m], i = 0, r = d(l);
  I([...t], (f, a) => {
    v(f) && d(f) > 1 && t.splice(a, 1, ...Se(f, ""));
  });
  for (let [f, a] of Le(t)) {
    if (i >= r) break;
    if ($(a)) {
      let c = 0, [s, n, o] = a;
      for (; i < r && c < o; ) {
        if (s(l[i]))
          c++, e[Q] += l[i];
        else {
          let u = !1, A, N = f;
          for (; N > -1 && (A = en(t, N + 1)); ) {
            if (tn(A, l, i)) {
              u = !0;
              break;
            }
            N = pf(t, A, N);
          }
          if (u && c >= n) break;
        }
        i++, Gt(e, i);
      }
    } else v(a) && (e[Q] += a, l[i] == a && i++, Gt(e, i));
  }
}, en = (e, t) => {
  for (let l = t; l < d(e); l++) {
    let i = e[l];
    if ($(i))
      return i;
  }
}, tn = (e, t, l) => {
  let i = !1;
  if ($(e)) {
    let [r, f, a] = e;
    if (Pe(r) && he(f) && he(a)) {
      let c = 0, s = d(t);
      for (let n = l; n < s && c < a; n++)
        r(t[n]) && c++;
      i = c > 0 && c >= f;
    }
  }
  return i;
}, ln = (e = {}) => (t) => {
  let l = t[m], i = d(l), r = Oe(e, "thousands", ","), f = Oe(e, "decimal", "."), a = Oe(e, "precision", 2);
  f == "," && (r = "."), r == "." && (f = ",");
  let c = !1, s = !1, n = [], o = [], [u] = ws();
  for (let N = 0; N < i; N++)
    l[N] == "-" ? !d(n) && !d(o) && (c = !0) : s ? d(o) < a && u(l[N]) && C(o, N) : l[N] == f ? s = !0 : u(l[N]) && (d(n) == 1 && l[n[0]] == "0" ? n[0] = N : C(n, N));
  t[Q] = c ? "-" : "";
  let A = d(n);
  t[ft] = !1;
  for (let N = 0; N < A; N++)
    N > 0 && (A - N) % 3 == 0 && (t[Q] += r), t[Q] += l[n[N]], Gt(t, n[N] + 1);
  t[Q] += s ? f : "";
  for (let N = 0; N < d(o); N++)
    t[Q] += l[o[N]], Gt(t, o[N] + 1);
  return t;
}, Gt = (e, t) => {
  if (!e[ft]) {
    let l = e[ve];
    l == 0 ? e[ft] = !0 : l <= t && (e[ft] = !0, e[ve] = d(e[Q]));
  }
}, rn = (e = 1, t = 1) => (e = he(e) && e >= 0 ? e : 1, t = he(t) && t > e ? t : e > 0 ? e : 1, [e, t]), Fl = (e, t, l) => [v(e) ? (r) => r == e : (r) => ue(r, e), ...rn(t, l)], sn = (e, t) => Fl(new RegExp("\\p{L}", "u"), e, t), ws = (e, t) => Fl(new RegExp("\\p{Nd}", "u"), e, t), fn = (e, t) => Fl(/[\p{L}\p{Nd}]/u, e, t), an = [U + mr, Za], nn = async (e, t, l) => {
  It(e, l, (i) => {
    let r = i();
    Pe(r) && r();
  });
}, cn = ["b-effect", nn], vl = (e, t, l) => (i, r, f) => {
  let a = i[ae][r] || {}, c = {
    [e]: !0
  };
  t.subtree = !1;
  for (let u in t)
    c[u] = a[u] || t[u];
  let s = i.exec(i, f, "$mutations", !1), n = Yt(s, a[Ut] || 100), o = new MutationObserver((u) => {
    u = En(e, l, u), d(u) && n(u);
  });
  o[oi](a[Z] || i.el, c), g(i, () => o[al]());
}, En = (e, t, l) => Oi(l, (i) => i.type === e && t(i)), sr = vl(
  "childList",
  {},
  (e) => d(e.addedNodes)
), fr = vl(
  "childList",
  {},
  (e) => d(e.removedNodes)
), ar = vl(
  "attributes",
  { attributeOldValue: !0, attributeFilter: b },
  () => !0
), nr = vl(
  "characterData",
  { characterDataOldValue: !0 },
  () => !0
), cr = Ge + "added" + me, Er = Ge + "removed" + me, or = Ge + "attrs", Tr = Ge + "text", on = [
  [cr, sr],
  [U + cr, sr],
  [Er, fr],
  [U + Er, fr],
  [or, ar],
  [U + or, ar],
  [Tr, nr],
  [U + Tr, nr]
], Tn = [
  /**
   * The b-ignore directive is used to stop the hydration of the element and its children.
   */
  Ra,
  /**
   * Conditional hydration
   * Notes:
   * - b-if stops the hydration flow of the element and starts a new hydration flow with a copy of the element whenever the condition evaluates to true
   * - the original element is replaced with a placeholder comment node to hold its location in the DOM
   * - whenever the condition evaluates to false, the copy of the element is dehydrated and removed from the DOM
   */
  Ba,
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
  Sa,
  /**
   * Run one or more scripts on the element, right after the context ($props, $data, $slot, $ref, $for, $id) is set up.
   * Notes:
   * - the b-script directive may hold one script or an array of scripts
   * - the script(s) are executed in order and awaited
   * - when b-script is in a script element the content of the src file or text content is added to the list of scripts to be executed
   */
  Ca,
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
  da,
  /**
   * Conditional display
   * Notes:
   * - the element is hydrated regardless of the condition
   * - the b-show directive toggles the `display` of the element based on the condition
   */
  Ya,
  // ['b-boost', hydrateBoost],
  Fa,
  // b-transition, b-transition-play, b-transition-reverse
  /**
   * The b-teleport moves the element to a different location in the DOM.
   * Notes:
   * - b-teleport also works with the b-if and b-template directives
   */
  $a,
  /**
   * Dynamic hydration of HTML or text content and styles
   * Notes:
   * - if the element has a b-html and b-text directive, the b-html directive is hydrated and the b-text directive is ignored
   * - b-style always hydrates regardless of the b-html and b-text directives
   */
  Pa,
  wa,
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
  ja,
  // [b-bind|bind]-[attributeName]
  Qa,
  an,
  /**
   * Event directives
   */
  ...ka,
  // [b-on|on]-[enter|exit]
  ...on,
  // [b-on|on]-[addednodes|removednodes|attrs|text]
  ...za,
  // [b-on|on]-[resize]
  Ka,
  // [b-on|on]-[eventName]
  /**
   * b-effect: used to create an effect that run when its dependencies change.
   * It is perfect for small expressions, reactive or not.
   * Example: console.log(`Hello, ${$data.name}!`)
   */
  cn
], pn = (e) => {
  I(Tn, (t) => C(e[Kr], t));
};
export {
  ja as bindDirective,
  Oa as dataDirective,
  cn as effectDirective,
  Na as forDirective,
  Pa as htmlDirective,
  Sa as idDirective,
  Ba as ifDirective,
  Ra as ignoreDirective,
  ka as intersectionDirectives,
  an as maskDirective,
  Qa as modelDirective,
  on as mutationDirectives,
  un as newApp,
  Ka as onDirective,
  za as resizeDirectives,
  Ca as scriptDirective,
  pn as setAllDirectives,
  hn as setup,
  Ya as showDirective,
  xa as styleDirective,
  $a as teleportDirective,
  da as templateDirective,
  wa as textDirective,
  Fa as transitionDirective
};
//# sourceMappingURL=briojs.2.1.0.js.map
