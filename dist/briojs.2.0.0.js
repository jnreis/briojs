let rl = "brio", At = "$", lt = "$for", Vl = "$ref", Kl = "$slot", ur = "$store", ct = "after", El = "append", Et = "array", Ee = "attr", oi = "Attribute", X = "b-", pr = "b-for", Ie = "b-if", hr = "b-ignore", Ti = "b-ref", Rr = "b-save", sl = "b-show", yr = "b-slot", jt = "before", ms = "body", fl = "boolean", Nr = "can only be used on", Ar = "Cannot ", Qe = "checkbox", be = "checked", Ds = "Child", Or = "class", _r = "clone", ui = "composi", pi = "content", Sr = "Content", Xt = "create", qt = "data", ol = "debounce", wr = "detail", $i = "default", Ir = "define", Y = "delete", Ve = "directive", jl = "disconnect", gs = "display", hi = "document", Fe = "element", al = "email", Pr = "end", Ui = "entries", Fi = "error", ds = "event", Cr = "EventListener", mr = "exit", Ke = "get", Dr = "head", Mi = "href", Ri = "html", yi = "HTML", Dl = "hydrate", xs = "index", Ls = "inner", $s = "insert", gl = "Invalid", gr = "length", dr = "mask", Us = "message", Fs = "method", fe = "must be", te = `
`, it = "newValue", Ms = "name", Tl = "Node", ot = "nodes", xr = "not found.", Ot = null, ee = "number", _t = "object", Lr = "observe", dt = "oldValue", Ni = "on-", Bi = Ni + "enter", vi = Ni + mr, Hi = Ni + "resize", Bs = "once", Ai = "operation", Ae = "options", vs = "outer", Yt = "parent", Yi = "patch", Hs = "post", Xl = "prepend", $r = "prevent", Ur = "Propert", je = Ur + "y", Qt = "props", Fr = "put", ki = "radio", He = "remove", Oi = "replace", Mr = "require", ul = "route", ae = "script", b = "skip", q = "select", Q = "state", Br = "start", _i = "storage", Le = "string", ie = "style", Ys = "super", vr = "teleport", ye = "template", Oe = "text", zi = "throttle", Si = "tion", Hr = "toString", rt = "transition", Yr = "type", Te, kr = "update", zr = "valid", $ = "value", wi = "With", Gr = "a " + zr, ks = "add" + Cr, st = At + qt, Jt = "$de" + Dl, Zt = At + Dl, dl = At + $s, pl = At + Qt, ze = X + qt, Wr = X + Ri, Ii = X + ae, xl = X + ye, zs = X + Oe, Vr = Ds + "ren", Kr = Or + "List", Gs = _r + Tl, hl = ui + "ng", Ws = ui + Si + Br, Vs = ui + Si + Pr, Ks = Xt + "Comment", js = Xt + "Element", ql = Ir + je, Xs = Ir + Ur + "ies", tt = "de" + Dl + Vr, Gi = Y + je, jr = Ve + "s", qs = "ends" + wi, Ll = "func" + Si, Qs = Ke + oi, Js = Ke + je + "Value", Zs = Ke + je + "Priority", Wi = Dr + "ers", Ut = Ls + yi, k = "in" + Fr, Ft = "of " + Yr, Xr = vs + yi, qr = "Own" + je, bs = Yt + Tl, Rl = "path" + Ms, ef = $r + "Default", Qr = "proto" + Yr, tf = He + oi, lf = He + Cr, rf = He + je, Mt = Oi + wi, xt = Oi + Vr, Pi = Mr + "s", nl = Mr + "d", Vi = ul + "Rule", zl = q + "ionStart", sf = q + "or", ff = "set" + oi, af = "set" + je, nf = Br + "s" + wi, cf = _i + "Area", oe = "tar" + Ke, et = Oe + "area", Tt = Oe + Sr, Ef = zr + "ate", of = "async" + Ll, Jr = Ke + qr + "Descriptor", Tf = Jr + "s", uf = "has" + qr, pf = (e, t, l, i) => `the ${e} ${t} ${Pi} ${l}, ` + $l(i), $l = (e) => `but got ${e} instead.`, Ql = Pi + " a reactive " + $, g = (e, ...t) => e.push(...t), hf = (e, t) => e.sort(t), ue = (e, t) => e.join(t), D = (e, t) => e.forEach(t), Pe = (e, t, l) => e.map(t, l), Bt = (e, t, l) => e.filter(t, l), Ci = (e, t, l) => e.find(t, l), mi = (e, t, l) => e.every(t, l), Zr = (e, t, l) => e.some(t, l), Rf = (e, t, l) => e.indexOf(t, l), yf = (e, t) => t[1] - e[1], Ge = (e) => Array.from(e), Ki = (e, t = 0) => Pe(Ge({ [gr]: e }), (l, i) => t + i), H = (e) => e.trim(), Ce = (e) => e.toLowerCase(), re = (e, t, l) => e.split(t, l), br = (e) => e.toUpperCase(), Nf = (e) => br(e[0]) + It(e, 1), Af = (e) => Ce(e[0]) + It(e, 1), kt = (e, t, l) => e[nf](t, l), Jl = (e, t, l) => e[qs](t, l), pe = (e, t) => t.test(e), J = (e, t, l) => e[Oi](t, l), Zl = (e, t, l) => {
  for (; pe(e, t); )
    e = J(e, t, l);
  return e;
}, Of = (e) => pe(e, /^\d+$/), es = (e) => pe(H(e), /^((async\s+)?function\s*\([^)]*\)\s*{[^}]*}|(async\s*)?(?:\([^()]*\)|[$\w]+)\s*=>)/), _f = (e) => Af(ue(Pe(re(e, "-"), Nf), "")), ts = (e) => JSON.stringify(e), Di = (e, t) => {
  try {
    e = JSON.parse(e, t);
  } catch {
  }
  return e;
}, Ul = (e) => "`" + e + "`", Re = (...e) => ue(e, " "), Me = (e) => Ce(It(Se[Qr][Hr].call(e), 8, -1)), Xe = (e, t) => Me(e) === t, se = (e) => e === Ot, yl = (e) => e === Te, z = (e) => Xe(e, _t), F = (e) => Xe(e, Et), _e = (e) => Sf(e) || wf(e), Sf = (e) => Xe(e, Ll), wf = (e) => Xe(e, of), B = (e) => Xe(e, Le), De = (e) => Xe(e, ee) && !isNaN(e), If = (e) => Xe(e, fl), Pf = (e) => St(e, ls), St = (e, t) => e instanceof t, ft = (e) => St(e, Node), Cf = (e) => St(e, Text), ge = (e) => St(e, HTMLElement), bl = (e) => St(e, Map), ei = (e) => St(e, Set), $e = window, Se = Object, mt = Reflect, Nl = location, wt = $e[hi], mf = Symbol, ls = RegExp, G = (e, t) => Se[Qr][uf].call(e, t), me = (e, t, l) => {
  let i = l;
  try {
    i = t in e ? e[t] : l;
  } catch {
  }
  return i;
}, qe = (e, t) => delete e[t], Df = [
  ["w", "writable"],
  ["e", "enumerable"],
  ["c", "configurable"]
], Z = (e, t, l = Te, i = "") => {
  if (B(i)) {
    let r = i;
    i = { [$]: l }, D(Df, ([a, s]) => {
      i[s] = !U(r, a);
    });
  }
  Se[ql](e, t, i);
}, at = (e) => x(Ne(e)), Ne = (e) => Se.keys(e), gf = (e = Ot) => Se[Xt](e), df = (e, t = {}) => {
  const l = gf(e);
  return Se[Xs](
    l,
    Se[Tf](t)
  ), l;
}, xf = (e, t, l = Se) => l[Jr](e, t), Lf = (e) => Se.getPrototypeOf(e), gi = (e, t = {}) => {
  D(Ne(e), (l) => {
    Z(e, l, e[l], t);
  });
}, is = (e) => D(Ne(e), (t) => {
  qe(e, t);
}), he = (e = Te) => new Map(e), We = (e = Te) => new Set(e), $f = (e, t) => new ls(e, t), vt = (e, t) => {
  if (e === t) return e;
  if (F(e) && F(t)) {
    for (; x(e) > x(t); ) e.pop();
    for (let l = 0; l < x(t); l++)
      l < x(e) ? e[l] = vt(e[l], t[l]) : e.push(Ue(t[l]));
  } else if (bl(e) && bl(t)) {
    let l = he(e);
    e.clear();
    for (let [i, r] of Be(t))
      e.set(i, l.has(i) ? vt(l.get(i), r) : Ue(r));
  } else if (ei(e) && ei(t)) {
    e.clear();
    for (let l of t)
      e.add(l);
  } else if (z(e) && z(t)) {
    let l = { ...e };
    is(e);
    for (let i in t)
      G(t, i) && (e[i] = G(l, i) ? vt(l[i], t[i]) : Ue(t[i]));
  } else
    return t;
  return e;
}, Ue = (e) => {
  let t = e;
  if (z(e)) {
    let l = {};
    for (let i in e)
      G(e, i) && (l[i] = Ue(e[i]));
    t = l;
  }
  return F(e) && (t = Pe(e, Ue)), bl(e) && (t = he(Pe(Ge(Be(e)), ([l, i]) => [l, Ue(i)]))), ei(e) && (t = We(Pe(Ge(e), Ue))), t;
}, U = (e, t, l) => e.includes(t, l), Be = (e) => z(e) ? Se[Ui](e) : e[Ui](), It = (e, t, l) => e.slice(t, l), x = (e) => e[gr], bt = (e, t = 0) => setTimeout(e, t), Uf = (e) => {
  clearTimeout(e);
}, Al = (e, t) => {
  let l;
  return (...i) => {
    Uf(l), l = bt(() => e(...i), t);
  };
}, Ff = (e, t) => {
  let l = 0;
  return (...i) => {
    let r = Date.now();
    if (!(r - l < t))
      return l = r, e(...i);
  };
}, ji = {}, Xi = (e) => It(J("b" + [1e20], /[01]/g, () => crypto.getRandomValues(new Uint8Array(1))[0][Hr](36)), 0, e), Ol = (e = 8) => {
  let t = Xi(e);
  for (; t in ji; ) t = Xi(x(t) + 1);
  return ji[t] = !0, t;
}, rs = (e, ...t) => console[e]("Brio.js", ...t), Pt = (...e) => rs("warn", "warn:", te, ...e), M = (...e) => rs(Fi, `detected an ${Fi}:`, te, ...e), di = (e, t = wt) => Ge(t.querySelectorAll(e)), ne = (e, t = wt) => B(e) ? di(e, t)[0] : e, we = (e, t, ...l) => e[t](...l), ss = (e) => e[Gs](!0), fs = (e, t) => D(Ge(e.attributes), ({ name: l, [$]: i }) => t(l, i)), ut = (e) => e[He](), _l = (e) => e[bs], as = (e) => H(e[Tt] || ""), cl = (e) => [...e.childNodes], j = (e, t) => e[Qs](t), xi = (e, t, l, i) => {
  i && (e[i] = l), e[ff](t, l);
}, Fl = (e, t) => e[tf](t), ns = (e, ...t) => e[Kr].add(...t), Mf = (e, ...t) => e[Kr][He](...t), qi = requestAnimationFrame, pt = (e) => qi(() => qi(e)), ti = (e, t) => wt[js](e, t), Li = (e) => wt[Ks](e), ve = (e) => Ce(e.tagName || ""), ce = (e, t, l, i) => (e = ne(e), e[ks](t, l, i), () => e[lf](t, l)), ke = (e, t, l) => ne(e).dispatchEvent(new CustomEvent(Ce(J(t, /[^a-z\d]/gi, "")), {
  bubbles: !0,
  cancelable: !0,
  [wr]: l
})), Sl = async (e, t, l = !1) => {
  if (await t(e))
    for (let i of cl(l && ve(e) == ye ? e[pi] : e))
      await Sl(i, t, l);
}, Bf = (e) => e[oe][hl] = !0, vf = (e) => {
  let t = e[oe];
  t[hl] && (t[hl] = !1, ke(t, k));
}, Hf = (e) => $e.getComputedStyle(e), Yf = (e) => {
  let t = Hf(e);
  return !(!_l(e) || t[gs] == "none" || t.visibility == "hidden" || t.opacity == "0");
}, zt = (e = "", t = Mi) => new URL(e, Nl[Mi])[t], cs = (e) => kt(zt(e), Nl.origin), Es = (e) => U(["src", $, be, q + "ed"], e), kf = (e) => J(J(e, /[^\w-]/g, ""), /^[^a-z_]+/i, ""), zf = (e) => {
  let t = {};
  for (let l of e)
    t[l] = e[Js](l), e[Zs](l) == Il && (t[l] += " !" + Il);
  return t;
}, wl = (e) => {
  let t = {}, l = {};
  for (let i in e)
    (kt(i, rt) ? t : l)[i] = e[i];
  return [t, l];
}, Il = "important", Gf = (e, t, l) => {
  let i = "";
  Jl(l + "", "!" + Il) && (l = H(It(l, 0, -10)), i = Il), e[ie][af](t, l, i);
}, Wf = (e, t) => {
  e[ie][rf](t);
}, Gt = (e, ...t) => {
  for (let l of t)
    for (let i in l)
      Gf(e, i, l[i]);
}, Pl = (e, ...t) => {
  for (let l of t)
    for (let i in l)
      Wf(e, i);
}, Cl = (e, t, l = !0) => new Function(e, l ? `return(${t})` : t), os = (e, t = "", l = !0) => (es(e) || (e = Vt(e), e = `(${t})=>` + (l ? `(${e})` : `{${e}}`)), e), Vf = (e, t = We()) => {
  let l = We(e);
  for (let i = 128; i <= 1114111; i++) {
    if (i >= 55296 && i <= 57343) continue;
    let r = String.fromCodePoint(i);
    if (!l.has(r) && !t.has(r)) return r;
  }
}, Kf = (e) => {
  let t = [], l = We();
  for (; pe(e, ci); ) {
    let i = Vf(e, l);
    if (!i) break;
    e = J(e, ci, (r, a) => (g(t, [i, a]), l.add(i), i));
  }
  return [e, t];
}, jf = (e, t) => {
  for (let l = x(t) - 1; l >= 0; l--) {
    let [i, r] = t[l];
    e = J(e, i, "${" + r + "}");
  }
  return e;
}, Qi = (e) => `only supports ${ue(It(e, 0, -1), ", ")}, and ${e[x(e) - 1]} insertions`, Xf = (e) => async (t, l, i, r) => {
  let a = dl + ":", s = l == Oe ? Tt : l, n = [jt, ct, Xl, El, Mt, xt, Oe], f = () => Zr(n, (d) => d == l);
  if (!f())
    return M(a, Qi(n));
  let c = ne(t);
  if (!ft(c))
    return M(a, oe, fe, Ft, Tl);
  if (ne(Ri) == c)
    return M(a, oe, "cannot be the", yi, Fe);
  if (n = [xt, Xl, El], (ne(Dr) == c || ne(ms) == c) && !f())
    return M(a, br(ve(c)), Fe, Qi(n));
  i = await i;
  let o = e[ye];
  i in o && (i = o[i]);
  let T = s == Tt, R = i, h = !1;
  if (!T && B(i) && (R = ti("div"), R[Ut] = H(i), h = !0), !T && !ft(R))
    return M(a, pi, fe, Ft, Tl, "or", Le);
  let I = me(r, sf);
  if (!T && I && B(I) && (R = ne(I, R), !ft(R)))
    return M(a, Fe, xr);
  let { n: A, g: m } = e.bnode, w = {};
  if (!T) {
    let d = {}, V = j(R.children[0], X + Qt);
    V && (d = Cl("", V)() || {});
    let O = [];
    for (let P in d) {
      let C = d[P], N = C, E = !1, p = !1, u;
      z(C) && (N = C.type, E = !!C[nl], u = C.warn, p = !!C.isText), F(N) || (N = [N]);
      let y = j(c, P);
      Fl(c, P), p && y && (y = Ul(y)), B(y) && (y = Cl("", y || "true")());
      let S = se(y) || yl(y);
      if (U(N, Me(y)) || (E && S ? g(O, "Missing required prop: " + P + ".") : g(O, Re(gl, "prop type for", P + ":", fe, Ft, ue(N, " or ") + ",", $l(Me(y))))), _e(u)) {
        let _ = u(y, P);
        _ && g(O, _);
      }
      if (S && $i in C) {
        let _ = C[$i];
        y = _e(_) && !U(N, Ll) ? _() : _;
      }
      w[P] = y;
    }
    D(O, (P) => Pt(P, c));
  }
  if (at(w)) {
    let d = m(c);
    d.ctx[pl] = w;
  }
  let v = e.gc[Jt];
  if (s == Mt) await v(c, !1);
  else if (T || s == xt)
    for (let d of cl(c)) await v(d, !1);
  let W = h ? cl(R) : [R];
  if (we(c, T ? xt : s, ...W), T && (W = cl(c)), D(W, (d) => {
    let V = [];
    ve(d) == ae ? g(V, d) : ge(d) && g(V, ...di(ae, d)), D(V, (O) => {
      if (mi([Ii, hr, Rr, yr], (P) => se(j(O, P)))) {
        let P = ti(ae);
        fs(O, (C, N) => xi(P, C, N, Es(C) && C)), P[Ut] = O[Ut], we(O, Mt, P);
      }
    });
  }), me(r, Dl, !0))
    for (let d of W) {
      if (ge(d)) {
        let V = A(d, c);
        await Hl(V);
      }
      await e.gc[Zt](d, c);
    }
  return W;
}, Gl = (e, t = "", l = "") => {
  let i = t == qt ? FormData : URLSearchParams, r = new i(), a = (s, n = "") => {
    z(s) || F(s) ? D(Be(s), ([f, c]) => {
      let o = n ? `${n}[${f}]` : f;
      a(c, o);
    }) : r[El](n, s);
  };
  return a(e, l), r;
}, Dt = (e) => async (t, l, i = {}) => {
  let r = "status", a = Sr + "-Type", s = me(i, "parser");
  if (z(l)) {
    let n = i[Wi] || {}, f = Ci(Ne(n), (o) => Ce(o) == Ce(a)), c = Ce(n[f] || "");
    qe(n, f), e == Ke || e == Y ? (t += Gl(l), l = Te) : Jl(c, "json") ? (l = ts(l), n[a] = "application/json") : Jl(c, "form-data") ? l = Gl(l, qt) : l = Gl(l), i[Wi] = n;
  }
  try {
    let n = await fetch(t, { ...i, [Fs]: e, body: l }), f = await n[s || Oe]();
    if (!s)
      try {
        f = Di(f);
      } catch {
      }
    if (!n.ok) {
      let c = new Error(`HTTP ${n[r]}! Status text: ` + n.statusText);
      throw c.response = n, c[pi] = f, c;
    }
    return f;
  } catch (n) {
    throw n;
  }
}, li = {
  get: Dt(Ke),
  post: Dt(Hs),
  put: Dt(Fr),
  [Yi]: Dt(Yi),
  [Y]: Dt(Y)
}, qf = (e, t) => [
  // Set a route
  (l, i) => {
    if (_e(i)) {
      l = zt(l, Rl);
      let r = Bt(re(l, "/"), H), a = x(r) - 1, s = e;
      D(r, (n, f) => {
        n in s || (s[n] = {}), s = s[n], f == a && (s[$t] = i);
      });
    } else M(Ar, "set route without a", ul, Ll, te, l);
  },
  /**
   * Get a route function by path.
   * 
   * @returns The route function, or `undefined` if not found, or `null` if not the same origin
   */
  (l) => {
    if (!cs(l))
      return Ot;
    l = zt(l, Rl);
    let i = Bt(re(l, "/"), H), r = e, a = {}, s = 0;
    for (let n of i) {
      if (s = 0, n in r && !kt(n, ":"))
        r = r[n], s = 1;
      else for (let f of Ne(r))
        if (kt(f, ":")) {
          let [c, o] = Bt(re(f, ":"), H);
          if (!o || o && o in t && t[o](n)) {
            let T = a[c];
            T ? F(T) ? g(T, n) : a[c] = [T, n] : a[c] = n, r = r[f], s = 1;
            break;
          }
        }
      if (!s) break;
    }
    if (s = s && r[$t] ? 1 : 0, s)
      return () => r[$t]({
        params: a,
        path: l,
        [He]: () => qe(r, $t)
      });
  }
], Ts = (e, t) => {
  e = zt(e, Rl), t && cs(e) ? (t(), e != Nl[Rl] && history.pushState(Ot, "", e)) : Nl.href = e;
}, Qf = (e) => Bl(({ [Q]: t, prop: l }) => (Wt(t)[b].add(l), e)), ii = !1, ri = [], us = (e) => (ri = [], ii = !0, e({}), ii = !1, [...ri]), ps = (e) => {
  let t = us(e), l = x(t), [i, r] = t[l - 1] || [];
  return [i, r];
}, de = (e, t) => {
  if (!Ji(e) || Rt(e)) return e;
  let l = {
    get(s, n) {
      return ii && (G(s, n) || !(n in s)) && g(ri, [i, n]), mt.get(s, n, i);
    },
    set(s, n, f) {
      n in s || Z(s, n);
      let c = i[n];
      if (c === f) return !0;
      let o = Wt(i), T = {
        [oe]: s,
        [Q]: i,
        prop: n,
        [dt]: c
        // [NEW_VALUE]: newValue,
        // [OPERATION]: UNDEFINED,
      };
      gi(T, "wc"), Lt.has(f) && (Lt[Y](f), f = f(T)), r.has(n) || (f = de(f)), T[it] = f, Jf(T);
      let R = mt.set(s, n, f, i);
      return Zi(o, T), R;
    },
    [Gi](s, n) {
      let f = s[n], c = mt[Gi](s, n);
      return Zi(Wt(i), {
        [oe]: s,
        [Q]: i,
        prop: n,
        [dt]: f,
        [it]: Te,
        [Ai]: Y
      }), c;
    },
    [ql](s, n, f) {
      let c = f[$], o = i[n];
      return Lt.has(c) && (f[$] = c({ [Q]: i, prop: n, [it]: c, [dt]: o })), !r.has(n) && $ in f && (f[$] = de(f[$])), mt[ql](s, n, f);
    }
  };
  const i = new Proxy(Rt(t) && z(t) ? df(t, e) : e, l), r = We();
  let a = {
    // [PARENT]: parent,
    // [TARGET]: target,
    // proxied,
    [Q]: he(),
    [Qt]: {},
    skip: r
    // refs: [],
    // [ON_SET]: {},
  };
  Ml.set(i, a);
  for (let s in e) {
    let n = e[s];
    Lt.has(n) && (n = n({
      [oe]: e,
      [Q]: i,
      prop: s,
      [dt]: Te
    })), !r.has(s) && Ji(n) && mt.set(e, s, n, i);
  }
  return i;
}, Ji = (e) => F(e) || z(e), Zi = (e, t) => {
  let l = he(), i = e[Qt][t.prop];
  i && D(i, (a, s) => l.set(s, a)), D(e[Q], (a, s) => l.set(s, a));
  let r = Ge(l);
  hf(r, yf);
  for (let [a] of r) a(t);
}, Jf = (e) => {
  e[Ai] = yl(e[dt]) ? Xt : yl(e[it]) ? Y : kr;
}, ht = (e, t, l = 0) => {
  let i = [], r = us(t || e);
  return D(r, ([a, s]) => {
    g(i, As(a, s, e, l));
  }), t && e({}), () => D(i, (a) => a());
}, Ht = (e, t, l, i = 0) => {
  let r;
  return Rt(e) ? B(t) || De(t) ? r = As(e, t, l, i) : r = Ns(e, l, i) : (M(Ar + `watch non-${Q} ${_t}/${Et}.`), r = () => {
  }), r;
}, hs = "getItem", Rs = "setItem", si = he(), Zf = (e) => {
  let t = Lf(e);
  return t && G(t, hs) && G(t, Rs);
}, fi = (e, t) => Di(e[hs](t) || ""), bi = (e, t, l) => e[Rs](t, ts(l)), er = (e) => "_b_" + e, ys = (e, t, l) => Zf(e) ? (l && (l = er(l), G(e, l) && (t = fi(e, l))), Bl(({ [Q]: r, prop: a }) => (si.set(l, [r, a, e]), l = l || er(a), G(e, l) ? t = fi(e, l) : bi(e, l, t), bt(() => Ht(r, a, () => {
  bi(e, l, r[a]);
})), t))) : M(gl, _i, _t), bf = (e, t) => ys(localStorage, e, t), ea = (e, t) => ys(sessionStorage, e, t), ta = (e) => {
  if (si.has(e.key)) {
    let [t, l, i] = si.get(e.key);
    i === e[cf] && (t[l] = fi(i, e.key));
  }
}, la = (e) => Bl(({ [Q]: t, prop: l }) => (ht(() => t[l] = e(), e), e())), Ml = he(), Lt = We(), Bl = (e) => Lt.add(e) && e, Rt = (e) => Ml.has(e), Wt = (e) => Ml.get(e), ai = (e) => Ml[Y](e), Ns = (e, t, l = 0) => {
  if (Rt(e)) {
    let i = Wt(e)[Q];
    return i.set(t, l), () => i[Y](t);
  }
}, As = (e, t, l, i = 0) => {
  let r = Wt(e)[Qt];
  r[t] || (r[t] = he()), r[t].set(l, i);
  let a = e[t], s;
  return Rt(a) && (s = Ns(a, l, i)), () => {
    s && s(), r[t][Y](l);
  };
};
Z(de, "init", Bl, "wc");
Z(de, b, Qf, "wc");
let tr = "matches", lr = "\\p{L}", ia = "\\p{Nd}", ra = $f(Zl(Zl("^(?!.*\\.{2})[w._%+-]+@(?:[w](?:[w-]*[w])?\\.)+[l]{2,}$", /w/, lr + ia), /l/, lr), "u"), sa = (e, t, l, i) => {
  let r = {};
  e || (e = {});
  let a = (f, c, o) => {
    let T = !1;
    return (B(f) || F(f)) && (T = o ? x(f) >= c : x(f) <= c), De(f) && (T = o ? f >= c : f <= c), T;
  }, s = {
    [nl]: (f) => !!f || f === 0,
    min: (f, c) => a(f, c, !0),
    max: (f, c) => a(f, c, !1),
    [al]: (f) => B(f) && pe(f, ra),
    same: (f, c, o) => f === o[c],
    in: (f, c) => F(c) && U(c, f),
    [tr]: (f, c) => B(f) && pe(f, c),
    type: (f, c) => s.in(Me(f), F(c) ? c : [c]),
    // Note that custom rules can override default rules
    ...l || {}
  }, n = {
    [nl]: (f) => Re(f, "is", nl + "."),
    min: (f, c) => Re(f, fe, "at least", c + "."),
    max: (f, c) => Re(f, fe, "at most", c + "."),
    [al]: (f) => Re(f, fe, Gr, al + "."),
    same: (f, c) => Re(f, "must match", c + "."),
    in: (f, c) => Re(f, fe, "equal to", ue(c, " or ") + "."),
    [tr]: (f) => f + " has an invalid format.",
    type: (f, c) => Re(f, fe, Ft, (F(c) ? ue(c, " or ") : c) + "."),
    // Note that custom messages can override default messages
    ...i || {}
  };
  for (let [f, c] of Be(t || {})) {
    let o = e[f];
    for (let [T, [R, h]] of Be(c)) {
      let I = s[T];
      I ? I(o, R, e) || (r[f] || (r[f] = []), h ? g(r[f], h) : g(r[f], n[T](f, R, e) || f + " is invalid.")) : Pt("Unknown rule: " + T);
    }
  }
  return !at(r) || r;
}, $t = mf(rl), Os = [];
We();
let Tn = () => {
  let e = (E) => T.get(E), t = (E, p = () => !0) => {
    let u = E ? _l(E) : Ot;
    for (; u; ) {
      let y = e(u);
      if (y && p(y)) return y;
      u = _l(u);
    }
  }, l = (E, p) => {
    let u = e(E);
    if (!u) {
      let y = p && e(p) || t(p || E);
      u = {
        // Local context
        // @ts-ignore
        ctx: { ...P },
        // A reference to the element. Convenience for internal use.
        el: E,
        [Yt]: y,
        // Unique ID context
        id: me(y, "id", {}),
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
        [b]: 0,
        ...N
      };
      for (let S in v) {
        let _ = v[S](u, y);
        _ && Z(u.ctx, S, _, "c");
      }
      T.set(E, u), u[Ae] = na(u, X + Ae)(u.ctx);
    }
    return u;
  }, i = async (E, p) => {
    B(E) && (E = ne(E)), B(p) && (p = ne(p)), ft(p) || (p = Te), ft(E) && (await n(E), await Sl(E, async (u) => {
      let y = !1, S = E == u ? p : Te;
      return Cf(u) && as(u) ? y = a(u, S) : ge(u) && (ve(u) == ae && se(j(u, Ii)) ? y = !1 : y = await s(u, S)), y;
    }));
  }, r = async (E, p = !0, u = !0) => {
    await Sl(E, async (y) => {
      let S = e(y);
      if (S) {
        if (S[ot])
          for (let _ of S[ot])
            await r(_, p, u);
        if (S[tt])
          for (let _ of S[tt])
            await r(_, p, u);
        S.ph && ut(S.ph), D(S.cFns, (_) => _()), u && T[Y](y);
      }
      return p && ut(y), !0;
    });
  }, a = (E, p) => {
    let u = E[Tt], y = Ea(Vt(u || ""));
    if (y && pe(y, ci)) {
      let S = l(E, p);
      y = ha(S, Ul(y));
      let _ = o(S, y, "", !0, !1);
      L(S, ht(() => E[Tt] = _(S.ctx))), ni(S, Oe, u);
    }
    return !1;
  }, s = async (E, p) => {
    let u = l(E, p);
    if (xe(u, 3)) return !0;
    for (let [y, S] of R) {
      let _ = [];
      if (Pf(y))
        fs(E, (K, el) => {
          pe(K, y) && g(_, [K, el]);
        });
      else {
        let K = j(E, y);
        se(K) || g(_, [y, K]);
      }
      for (let [K, el] of _) {
        if (xe(u, 1) || xe(u, 3)) break;
        ni(u, K, el), await S(u, K, Vt(el));
      }
      if (xe(u, 1) || xe(u, 3)) break;
    }
    return xe(u, 0) && (u[b] = 1), at(u[Ee]) || T[Y](E), !xe(u, 2) && !xe(u, 3);
  }, n = async (E) => {
    let p = await _s(E, Rr, []);
    D(p, ([u, y]) => {
      let S = ve(y), _ = S != ae && S != ie ? ye : S, K = y[_ == ye ? Xr : Ut];
      N[_][u] = H(K);
    });
  }, f = (E) => (p, u) => {
    N[E][p] = u;
  }, c = (E, p, u = "", y = !0, S = !0) => {
    let _;
    return p = os(S ? Ss(E, p) : p, u, y), p in w ? _ = w[p] : (_ = Ol(), m[_] = Cl(Yl(E, p), p), w[p] = _), _;
  }, o = (E, p, u = "", y = !0, S = !0) => {
    let _;
    try {
      let K = p in m ? p : c(E, p, u, y, S);
      _ = m[K](E.ctx);
    } catch (K) {
      M(K[Us]), _ = () => $t;
    }
    return _;
  }, T = he(), R = [], h = {}, I = {}, A = { [ee]: Of }, m = {}, w = {}, v = {
    // The $data context
    [st]: oa(st, ze),
    // Reactive properties defined in the element or inherited from the parent context
    [pl]: (E, p) => (p == null ? void 0 : p.ctx[pl]) || {},
    // The $for context
    [lt]: (E, p) => p == null ? void 0 : p.ctx[lt],
    // Data Level Context:
    // Referenced under the same $data context, not including nested $data contexts
    [Vl]: ir(Vl),
    [Kl]: ir(Kl),
    // The element itself
    $el: (E) => E.el,
    // Unique identifier for the element
    $id: (E) => E.id,
    $cleanup: (E) => (p) => L(E, p)
  }, [W, d] = qf(I, A), V = (E) => Ts(E, d(E)), O = {
    [ul]: W,
    [Vi]: f(Vi + "s"),
    [ye]: f(ye),
    [ie]: f(ie),
    [ae]: f(ae),
    data: f(qt)
  }, P = {
    [ur]: de({}),
    $set: O,
    [Zt]: i,
    [Jt]: r
  }, C = {
    http: li,
    [Q]: de,
    watch: Ht,
    effect: ht,
    computed: la,
    persist: bf,
    session: ea,
    [ul]: V,
    emit: ke,
    listen: ce,
    /** Get the local context of an element */
    context: (E) => {
      var p;
      return (p = e(ne(E))) == null ? void 0 : p.ctx;
    },
    // Tools
    hasProp: G,
    getProp: me,
    setProp: Z,
    sync: vt,
    [_r]: Ue,
    [Ef]: sa,
    uid: Ol,
    getType: Me
  };
  D(Ne(C), (E) => P[At + E] = C[E]);
  let N = {
    [ye]: h,
    [ie]: {},
    [ae]: {},
    data: {},
    // ! HYDRATION
    [jr]: R,
    bnode: { n: l, g: e, a: T },
    routes: I,
    routeRules: A,
    // ! PUBLIC CONTEXT
    gc: P,
    exec: o
  };
  return P[dl] = Xf(N), g(Os, d), D([O, li, P, N], (E) => gi(E, "wc")), N;
}, xe = (e, t) => e[b] == t, L = (e, t) => {
  g(e.cFns, t);
}, yt = (e, t) => {
  let l = e[Yt];
  l && (l[tt] || (l[tt] = []), U(l[tt], t) || g(l[tt], t));
}, fa = (e) => Ci(Nt(e), (t) => _l(t)), Nt = (e) => {
  let t = [], { g: l } = e.bnode;
  return e.ph && g(t, e.ph), D(e[ot] || [e.el], (i) => {
    let r = l(i);
    r && G(r.attr, xl) ? g(t, ...Nt(r)) : g(t, i);
  }), t;
}, aa = (e) => {
  D(Nt(e), (t) => {
    t != e.ph && ut(t);
  });
}, na = (e, t, l = {}) => {
  let i = () => l, r = ge(e.el) ? j(e.el, t) : null;
  return se(r) || ni(e, t, r), r && H(r) && (r = Vt(r), i = e.exec(e, r, Yl(e, r))), i;
}, ni = (e, t, l) => {
  e[Ee][t] = l, ge(e.el) && Fl(e.el, t);
}, Vt = (e) => J(ue(Pe(re(e, te), (t) => kt(H(t), "//") ? "" : t), te), /;$/, ""), ci = /\${((?!.*\${).*?)}/, ca = /{{((?!.*{{).*?)}}/, Ea = (e, t = "${$1}") => Zl(e, ca, t), oa = (e, t, l) => (i, r) => {
  let a = i.el, s = r ? r.ctx[e] : Ot, n = ge(a), f = n && !se(j(a, t)), c = n && (i[Ee][Ie] || !se(j(a, Ie))), o = n && (!s || f);
  return o && !f && t == ze && xi(a, ze, ""), o && !c ? de({}, l) : s || {};
}, ir = (e) => (t, l) => !l || ge(t.el) && !se(j(t.el, ze)) ? {} : l.ctx[e], Ta = () => {
  let e = zt();
  Ts(e, Ci(Os, (t) => t(e)));
}, un = (e = {}) => {
  rl in $e || (gi(e, "wc"), Z($e, rl, e, "wc"), ce($e, _i, ta), ce($e, "pop" + Q, Ta)), ke($e, rl);
}, vl = (e) => (e.match(/^(b-\w+|bind|on)(-([\w-$]+))?$/) || [])[3] || "", Hl = async (e) => {
  await rr(e, yr), await rr(e, Ti);
}, rr = async (e, t) => {
  let l = t == Ti, i = e.ctx[l ? Vl : Kl], r = l ? [
    /*B_IF,*/
    pr,
    xl,
    ze
  ] : [ze];
  for (let a of e[ot] || [e.el]) {
    let s = await _s(a, t, r);
    D(s, ([n, f]) => {
      i[n] = l ? f : f[Xr], L(e, () => qe(i, n));
    });
  }
}, _s = async (e, t, l) => {
  let i = [], r = t != Ti;
  return await Sl(e, (a) => {
    if (ge(a)) {
      if (Zr(l, (n) => !se(j(a, n)))) return !1;
      let s = j(a, t);
      s && (Fl(a, t), g(i, [s, a]), r && ut(a));
    }
    return !0;
  }, r), i;
}, Yl = (e, t) => "{" + ue(Bt(Ne(e.ctx), (l) => U(t, l)), ",") + "}", ua = (e, t) => {
  for (let l of [lt, st, pl, ur]) {
    let i = e.ctx[l];
    if (i && t in i) {
      t = l + "." + t;
      break;
    }
  }
  return t;
}, pa = new RegExp("(?<![.`'\"][\\w\\s$]*)[a-z_$][\\w$]*(?![\\w\\s$]*[:`'\"{])", "gi"), Ss = (e, t) => J(t, pa, (l) => ua(e, l)), ha = (e, t) => {
  let [l, i] = Kf(t);
  for (let r of i)
    r[1] = Ss(e, r[1]);
  return jf(l, i);
}, Ct = (e, t, l) => {
  let i = e.exec(e, t);
  L(e, ht(() => l(i)));
}, ws = (e, t, l) => {
  let i = [];
  return l && (l in t ? g(i, t[l]) : (l = e.exec(e, l)(), F(l) && D(l, (r) => {
    r in t && g(i, t[r]);
  }))), i;
}, Ra = async (e, t) => {
  e[b] = 3;
}, ya = [hr, Ra], sr = /^[a-z_$][\w$]*$/i, Na = (e, t, l) => {
  let i = e.el, { n: r, g: a } = e.bnode;
  e[b] = 3;
  let [s, n] = Pe(re(l, " in "), H), [f, c] = Pe(re(s, ","), H);
  c || (c = xs);
  let o = Re("the", t, Ve, Pi);
  if (!pe(f, sr) || !pe(c, sr))
    return M(o, Gr, "alias.");
  let T = e.exec(e, n), [R, h] = ps(T), I = R ? R[h] : T(), A = R && Rt(I), m = !1;
  if (De(I) && (I = de(Ki(I, 1)), m = !0, R && ht(() => {
    let O = R[h] || 0;
    De(O) && vt(I, Ki(O, 1));
  }, () => R[h])), !(F(I) || z(I)))
    return M(o, `an ${Et}, ${_t}, or ${ee}.`);
  e.ph = Li(t), we(i, Mt, e.ph), yt(e, i);
  let w = {}, v = async ([O, P]) => {
    let C = ss(i);
    we(e.ph, jt, C);
    let N = r(C, i);
    N[Ee][t] = "", G(e[Ee], Ie) && (N[Ee][Ie] = "");
    let E = de({}, N.ctx[lt]);
    Z(E, f, P, "c"), Z(E, c, O, "c"), Z(N.ctx, lt, E, "c"), L(N, () => {
      ai(E);
    }), L(N, Ht(E, c, ({ [it]: p }) => {
      let u = w[O][1];
      p !== u && (E[c] = u);
    })), A && L(N, Ht(E, f, () => {
      I[E[c]] = E[f];
    })), w[O] = [C, O], await Hl(N), await e.gc[Zt](C, i);
  }, W = ([O, P]) => {
    let C = w[O], N = a(C && C[0]);
    if (N) {
      let E = N.ctx[lt];
      E[f] = P, E[c] = O, C[1] = O;
    }
  }, d = ([O, P]) => {
    let [C] = w[O];
    e.gc[Jt](C), qe(w, O);
  }, V = {
    [Xt]: v,
    [kr]: W,
    [Y]: d
  };
  for (let O of Be(I))
    v(O);
  R && L(e, Ht(I, Te, ({ [Ai]: O, prop: P, [it]: C }) => {
    V[O]([P, C]);
  })), L(e, () => {
    for (let O in w)
      d([Number(O), null]);
    m && ai(I);
  });
}, Aa = [pr, Na], Oa = async (e, t, l) => {
  var a;
  let i = e.data[l];
  !_e(i) && l && (i = e.exec(e, l, Yl(e, l) + ",$" + Yt));
  let r = _e(i) ? await i(e.ctx, ((a = e[Yt]) == null ? void 0 : a.ctx[st]) || {}) : {};
  if (!z(r))
    return e[b] = 3, M(pf(Ve, t, "an " + _t, Me(r)));
  for (let s in r) Z(e.ctx[st], s, r[s], xf(r, s));
  await Hl(e), L(e, () => {
    bt(() => {
      ai(e.ctx[st]);
    });
  });
}, _a = [ze, Oa], fr = {}, Sa = async (e, t, l) => {
  if (l) {
    let i = e.exec(e, l)();
    if (!F(i) || !mi(i, B))
      return M("the", t, Ve, fe, `an ${Et} of ${Le}(s).`);
    e.id = i.reduce((r, a) => {
      let s = Ol(5);
      return fr[s] = !0, Z(r, a, s, "wc"), r;
    }, {}), L(e, () => {
      for (let r in e.id) qe(fr, e.id[r]);
    });
  }
}, wa = ["b-id", Sa], Is = (e) => (t, l, i) => {
  if (!(G(t[Ee], xl) || G(t[Ee], Wr) && e == Oe)) {
    let r = t[Ae][l] || {};
    t[b] = 2;
    let a = t[ye];
    i in a && (i = Ul(i)), i && Ct(t, i, async (s) => {
      await t.gc[dl](t.el, e, s(), r), t[b] = 3;
    });
  }
}, Ia = [Wr, Is(xt)], Pa = [zs, Is(Oe)], Ca = async (e, t, l) => {
  let i = e[Ae][t] || {}, r = e.el, a = l ? e[ye][l] || e.exec(e, l)() : r[Ut];
  e[b] = 2, B(a) ? (e[ot] = await e.gc[dl](r, jt, H(a), i), yt(e, r), ut(r)) : Pt(t + ":", gl, $, te, a);
}, ma = [xl, Ca], Da = async (e, t, l) => {
  let i = e.el;
  e[b] = 2;
  let r = ws(e, e[ae], l);
  if (ve(i) == ae) {
    yt(e, i);
    let a = j(i, "src"), s = a ? await li.get(a) : as(i);
    s && g(r, Vt(s)), ut(i);
  }
  for (let a of r) {
    let s = a;
    if (B(s)) {
      let n = es(s);
      s = Cl(Yl(e, s), s, n), n && (s = s(e.ctx));
    }
    _e(s) && await s(e.ctx);
  }
}, ga = [Ii, Da], da = new RegExp("(?<=(?:^|})\\s*)\\S(?:.\\s*?)*?(?=\\s*{)", "g"), xa = (e, t, l) => {
  let i = e.el;
  if (l && ve(i) != ie) {
    let r = ws(e, e[ie], l), a = Ol();
    ns(i, a), a = "." + a;
    let s = ti(ie);
    we(i, ct, s);
    let n = ue(r, te);
    n = J(n, /([{;])\s*/g, "$1" + te + "    "), n = J(n, /\s*}\s*/g, te + "}" + te), s[Tt] = J(n, da, (f) => {
      let c = H(f);
      return U(f, "&") ? c = J(c, /&/g, a) : c = ue(Pe(re(c, ","), (o) => a + " " + H(o)), "," + te), c;
    }), e.gc[Zt](s, i), L(e, () => {
      e.gc[Jt](s);
    });
  }
}, La = [X + ie, xa], $a = (e, t, l) => {
  let i = l, r, a = e.ctx.$ref;
  i in a && (i = Ul(i)), Ct(e, i, (s) => {
    i = s(), F(i) && ([i, r] = i), B(i) && i in a && (i = a[i]), U([jt, ct, Xl, El], r) || (r = ct), ft(i) ? (we(i, r, ...Nt(e)), yt(e, e.el)) : Pt(vr, Fe, xr, t + `="${l}"`);
  });
}, Ua = [X + vr, $a], ml = he(), Fa = (e, t, l) => {
  if (e[ot]) return;
  if (!(G(e[Ee], Ie) ? Ie : G(e[Ee], sl) ? sl : ""))
    return M("the", t, Ve, fe, "used with", Ie, "or", sl + ".");
  let r = e.exec(e, l)();
  F(r) || (r = [r]);
  let [a, s] = r;
  if (!z(a))
    return M("the", t, fe, "an", _t + ".");
  z(s) || (s = a);
  let n = Ba(e.el, a, s);
  ml.set(e.el, n), L(e, n[He]), L(e, () => ml[Y](e.el));
}, Ma = [X + rt, Fa], ar = (e, t, l, i) => {
  let [r, a] = wl(t), [s, n] = wl(l);
  Pl(e, a, r, s), Gt(e, n, i ? { [rt]: "none" } : {}), pt(() => {
    Gt(e, s), Pl(e, n);
  });
}, nr = (e, t, l) => {
  let [i, r] = wl(t), [a, s] = wl(l);
  Pl(e, r, i), Gt(e, s, a);
}, cr = () => (/* @__PURE__ */ new Date()).getTime(), Ba = (e, t, l) => {
  if (!ge(e))
    return M(gl, rt, Fe, e);
  let i = null, r = 1, a = 2, s = 3, n = 4, f = r, c = zf(e[ie]), o = 0, T = ce(e, rt + "run", (m) => {
    m[oe] === e && (o = cr());
  }), R, h = ce(e, rt + Pr, (m) => {
    m[oe] === e && (f == a ? f = n : f == s && (f = r), Pl(e, t, l), Gt(e, c), R && R());
  }), I = () => {
    T(), h();
  }, A = (m, w) => {
    R = w;
    let v = cr();
    m && i && f == n || !m && i === !1 && f == n || (m ? i === !1 && f == a ? (f = s, ar(e, t, l)) : (ar(e, l, t, f == r), i = !0, f = a) : i === null ? (i = !1, f = n, R && R()) : i && f == a ? (f = s, nr(e, l, t)) : (i = !1, f = a, nr(e, t, l)), bt(() => {
      o < v && R && R();
    }, 50));
  };
  return Z(A, He, I), A;
}, va = (e, t, l) => {
  let i = e.el;
  e.ph = Li(t), we(i, Mt, e.ph), e[b] = 3, yt(e, i);
  let { n: r } = e.bnode, a, s, n = () => {
    e.gc[Jt](a.el), a = Te;
  };
  Ct(e, l, (f) => {
    let c = f();
    pt(async () => {
      if (c) {
        if (!a) {
          let o = ss(i);
          we(e.ph, ct, o), a = r(o, i), a[Ee][Ie] = "", await Hl(a), await e.gc[Zt](o, i), yt(e, o);
        }
        s = ml.get(a.el), s && s(!0);
      } else !c && a && (s ? s(!1, n) : n());
    });
  });
}, Ha = [Ie, va], gt = he(), Ya = (e, t, l) => {
  e.ph = Li(t), we(fa(e), jt, e.ph);
  let i, r = () => {
    aa(e), gt.set(e.ph, e);
  };
  Ct(e, l, (a) => {
    let s = a();
    pt(() => {
      let n = Nt(e);
      if (i = ml.get(e.el), s) {
        if (gt.has(e.ph)) {
          for (let f of n)
            if (gt.has(f) && f !== e.ph) {
              let c = gt.get(f), o = Nt(c);
              n = Bt(n, (T) => !U(o, T) || T === c.ph);
            }
          gt[Y](e.ph), we(e.ph, ct, ...n);
        }
        i && i(!0);
      } else i ? i(!1, r) : r();
    });
  });
}, ka = [sl, Ya], tl = (e, t, l) => {
  let i = vl(t), [r] = re(i, "-"), a = e[Ae][t] || {}, s = e.el, n = e.exec(e, l, "$entry", !1), f = Al(n, a[ol] || 100), c = new IntersectionObserver((o) => {
    D(o, (T) => {
      T.isIntersecting != (r == mr) && (f(T), a[Bs] && c[jl]());
    });
  }, a);
  c[Lr](s), L(e, () => c[jl]());
}, za = [
  [Bi, tl],
  [X + Bi, tl],
  [vi, tl],
  [X + vi, tl]
], Er = (e, t, l) => {
  let i = vl(t);
  re(i, "-");
  let r = e.el, a = e[Ae][t] || {}, s = a[hi] ? ne(Ri) : r, n = e.exec(e, l, "$size", !1), f = Al(n, a[ol] || 100), c = new ResizeObserver((o) => {
    let T = o[0].borderBoxSize[0];
    f([T.inlineSize, T.blockSize]);
  });
  c[Lr](s, a), L(e, () => c[jl]());
}, Ga = [
  [Hi, Er],
  [X + Hi, Er]
], Je = "keyup", Ze = "keydown", or = "outside", Wa = "window", Ps = "control", Ei = "meta", ll = "arrow", Tr = [
  Ei,
  Ps,
  "shift",
  "alt",
  "fn"
], Va = {
  ctrl: Ps,
  cmd: Ei,
  [Ys]: Ei,
  esc: "escape",
  del: Y,
  up: ll + "up",
  down: ll + "down",
  left: ll + "left",
  right: ll + "right"
}, Ka = (e, t, l) => {
  let i = vl(t), [r, ...a] = re(i, "-"), s = e.el, n = s, f = e.exec(e, l, At + ds), c = (A) => {
    let m = f(A);
    _e(m) && m(A);
  }, o = e[Ae][t] || {};
  D(a, (A) => {
    o[A] = !0;
  }), ol in o && (c = Al(c, o[ol])), zi in o && (c = Ff(c, o[zi])), o[or] || o[hi] ? n = wt : o[Wa] && (n = $e);
  let T = {};
  U([Ze, Je], r) && D(me(o, "keys", []), (A) => {
    T[Va[A] || A] = !0;
  });
  let R = at(T), h = r;
  if (U([Ze, Je], r) && R) {
    let A = {};
    r = t;
    let m = Al((w) => {
      ke(n, r, w);
    }, 600);
    L(e, ce(n, Ze, (w) => {
      let v = Ce(w.key);
      A[v] || (A[v] = !0), bt(() => {
        A.meta && !U(Tr, v) && Wl(w, A);
      });
      let W = Ne(A);
      R > 1 && Je == h && A.meta && !U(Tr, v) ? m(W) : Ze == h && ke(n, r, W);
    })), L(e, ce(n, Je, (w) => {
      Ze == h && Wl(w, A), ke(n, r, Ne(A)), Je == h && Wl(w, A);
    })), L(e, ce(n, "focus", () => {
      is(A);
    }));
  }
  L(e, ce(n, r, (A) => {
    if (o[$r] && A[ef](), o.stop && A.stopPropagation(), !(o.self && A[oe] !== A.currentTarget) && !(o[or] && (s.contains(A[oe]) || !Yf(s)))) {
      if (U([Ze, Je], h)) {
        let m = A[wr];
        if (!(at(T) == at(m) && mi(Ne(T), (w) => U(m, w))))
          return;
      }
      c(A);
    }
  }, o));
}, Wl = (e, t) => qe(t, Ce(e.key)), ja = [/^(b-on|on)-([\w-$]+)$/, Ka], Xa = (e, t, l) => {
  let i = e.el, r = vl(t), a = os(l || _f(r), "$initial");
  r = kf(r);
  let s = j(i, r), n = e[Ae][t] || {};
  Ct(e, a, (f) => {
    if (!f)
      return Pt(l, Ql, $l(t + `="${l}"`), te, i);
    let c = f(s || ""), o = n.prop || Es(r) && r;
    if (c || o)
      if (r == ie && z(c))
        Gt(i, c);
      else if (r == Or && z(c))
        for (let T in c)
          c[T] ? ns(i, T) : Mf(i, T);
      else
        xi(i, r, !o && c === !0 ? "" : c, o);
    else Fl(i, r);
  });
}, qa = [/^(b-bind|bind)-([\w-$]+)$/, Xa], il = he(), Qa = (e, t, l) => {
  let i = Re("the", t, Ve), r = q + "ed", a = t + `="${l}"`, s = e.el, n = ve(s), f = s.type;
  if (!U([k, et, q], n))
    return M(i, Nr, k, `, ${et}, and ${q} ${Fe}s.`, a, s);
  let [c, o] = ps(e.exec(e, l));
  if (!c)
    return M(i, Ql, a, s);
  let T = c[o], R, h = () => Ge(n == q ? s[Ae] : v()), I = e[Ae][t] || {}, A = (N) => {
    let E = N[se(j(N, $)) && w ? be : $], p = il.get(N) || I;
    if (B(E) && (p.trim && (E = H(E)), !p.raw)) {
      let u = Di(E);
      (De(u) || se(u) || If(u)) && (E = u);
    }
    return E;
  }, m = (N) => n == k && U(N, f), w = m([Qe, ki]), v = () => di(k + `[type="${Qe}"][name="${s.name}"]`), W = () => m(Qe) && x(v()) > 1, d = () => {
    let N = [
      [k, Qe, [ee, Le, fl, Et]],
      [k, ki, [ee, Le, fl]],
      [k, ee, [ee]],
      [k, "range", [ee]],
      [k, "", [ee, Le]],
      [et, "", [ee, Le]],
      [q, "", [ee, Le, fl, Et]]
    ];
    for (let [E, p, u] of N)
      if (n == E && (!p || f == p)) {
        se(T) || yl(T) || U(u, Me(T)) || Pt(i, Ql, Ft, ue(u, " or "), `for ${n == k ? f + " " : ""}${E} ${Fe}s,`, $l(Me(T)), a, s);
        break;
      }
  };
  pt(() => {
    d(), q == n ? D(h(), (N) => il.set(N, I)) : m(Qe) && il.set(s, I);
  });
  let V = () => {
    if (T = c[o], R = A(s), U([k, et], n))
      if (f == Qe && F(T))
        s[be] = U(T, R);
      else if (w)
        s[be] = T === R;
      else {
        if (s[hl] || wt.activeElement === s && T === R) return;
        T !== R && (s[$] = T);
      }
    else n == q && (F(T) ? D(h(), (N) => {
      N[r] = U(T, A(N));
    }) : s[$] = T);
  };
  pt(() => L(e, ht(V)));
  let O = {}, P = () => {
    if (T = c[o], n == q && s.multiple || W()) {
      let N = [];
      D(h(), (E) => {
        n == q && il.set(E, I), (E[r] || E[be]) && g(N, A(E));
      }), c[o] = N;
    } else c[o] = w && !s[be] ? !1 : A(s);
  };
  (m([Oe, "search", "url", "tel", al, "password"]) || n == et) && (O[Ws] = Bf, O[Vs] = vf);
  let C = I.lazy || w || n == q ? "change" : k;
  O[C] = P;
  for (let [N, E] of Be(O))
    L(e, ce(s, N, E));
}, Ja = ["b-model", Qa], le = "output", Ye = "cursor", nt = Ye + "Updated", Za = "updateCursor", ba = (e, t, l) => {
  let i = e.el;
  if (!($ in i && zl in i))
    return M("the", t, Ve, Nr, et, Fe + "s and textual", k, "types (text, email, etc.).");
  let r = {
    exp: e.exec(e, l, "$mask"),
    [$]: "",
    [Ye]: i[zl],
    [Za]: Kt,
    [nt]: !1,
    [le]: "",
    char: kl,
    letter: fn,
    [ee]: Cs,
    alpha: an,
    money: rn
  }, a = () => {
    r[$] = i[$], r[$] != r[le] && (r[Ye] = i[zl], en(r), i[$] = r[le], i.setSelectionRange(r[Ye], r[Ye]), ke(i, dr, r));
  };
  pt(a), L(e, ce(i, k, a, !0));
}, en = (e) => {
  e[nt] = !1, e[le] = "";
  let t = e.exp(e);
  if (_e(t)) {
    t(e);
    return;
  }
  let l = e[$], i = 0, r = x(l);
  D([...t], (a, s) => {
    B(a) && x(a) > 1 && t.splice(s, 1, ...re(a, ""));
  });
  for (let [a, s] of Be(t)) {
    if (i >= r) break;
    if (F(s)) {
      let n = 0, [f, c, o] = s;
      for (; i < r && n < o; ) {
        if (f(l[i]))
          n++, e[le] += l[i];
        else {
          let T = !1, R, h = a;
          for (; h > -1 && (R = tn(t, h + 1)); ) {
            if (ln(R, l, i)) {
              T = !0;
              break;
            }
            h = Rf(t, R, h);
          }
          if (T && n >= c) break;
        }
        i++, Kt(e, i);
      }
    } else B(s) && (e[le] += s, l[i] == s && i++, Kt(e, i));
  }
}, tn = (e, t) => {
  for (let l = t; l < x(e); l++) {
    let i = e[l];
    if (F(i))
      return i;
  }
}, ln = (e, t, l) => {
  let i = !1;
  if (F(e)) {
    let [r, a, s] = e;
    if (_e(r) && De(a) && De(s)) {
      let n = 0, f = x(t);
      for (let c = l; c < f && n < s; c++)
        r(t[c]) && n++;
      i = n > 0 && n >= a;
    }
  }
  return i;
}, rn = (e = {}) => (t) => {
  let l = t[$], i = x(l), r = me(e, "thousands", ","), a = me(e, "decimal", "."), s = me(e, "precision", 2);
  a == "," && (r = "."), r == "." && (a = ",");
  let n = !1, f = !1, c = [], o = [], [T] = Cs();
  for (let h = 0; h < i; h++)
    l[h] == "-" ? !x(c) && !x(o) && (n = !0) : f ? x(o) < s && T(l[h]) && g(o, h) : l[h] == a ? f = !0 : T(l[h]) && (x(c) == 1 && l[c[0]] == "0" ? c[0] = h : g(c, h));
  t[le] = n ? "-" : "";
  let R = x(c);
  t[nt] = !1;
  for (let h = 0; h < R; h++)
    h > 0 && (R - h) % 3 == 0 && (t[le] += r), t[le] += l[c[h]], Kt(t, c[h] + 1);
  t[le] += f ? a : "";
  for (let h = 0; h < x(o); h++)
    t[le] += l[o[h]], Kt(t, o[h] + 1);
  return t;
}, Kt = (e, t) => {
  if (!e[nt]) {
    let l = e[Ye];
    l == 0 ? e[nt] = !0 : l <= t && (e[nt] = !0, e[Ye] = x(e[le]));
  }
}, sn = (e = 1, t = 1) => (e = De(e) && e >= 0 ? e : 1, t = De(t) && t > e ? t : e > 0 ? e : 1, [e, t]), kl = (e, t, l) => [B(e) ? (r) => r == e : (r) => pe(r, e), ...sn(t, l)], fn = (e, t) => kl(new RegExp("\\p{L}", "u"), e, t), Cs = (e, t) => kl(new RegExp("\\p{Nd}", "u"), e, t), an = (e, t) => kl(/[\p{L}\p{Nd}]/u, e, t), nn = [X + dr, ba], cn = async (e, t, l) => {
  Ct(e, l, (i) => {
    let r = i();
    _e(r) && r();
  });
}, En = ["b-effect", cn], on = [
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
  _a,
  /** List rendering
   * Notes:
   * - b-for stops the hydration flow of the element and starts a new hydration flow for each item it creates
   */
  Aa,
  /**
   * Unique ID generator
   */
  wa,
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
  ma,
  /**
   * Conditional display
   * Notes:
   * - the element is hydrated regardless of the condition
   * - the b-show directive toggles the `display` of the element based on the condition
   */
  ka,
  // ['b-boost', hydrateBoost],
  Ma,
  // b-transition, b-transition-play, b-transition-reverse
  /**
   * The b-teleport moves the element to a different location in the DOM.
   * Notes:
   * - b-teleport also works with the b-if and b-template directives
   */
  Ua,
  /**
   * Dynamic hydration of HTML or text content and styles
   * Notes:
   * - if the element has a b-html and b-text directive, the b-html directive is hydrated and the b-text directive is ignored
   * - b-style always hydrates regardless of the b-html and b-text directives
   */
  Ia,
  Pa,
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
  qa,
  // [b-bind|bind]-[attributeName]
  Ja,
  nn,
  /**
   * Event directives
   */
  ...za,
  // [b-on|on]-enter, [b-on|on]-exit
  ...Ga,
  // [b-on|on]-resize
  ja,
  // [b-on|on]-[eventName]
  /**
   * b-effect: used to create an effect that run when its dependencies change.
   * It is perfect for small expressions, reactive or not.
   * Example: console.log(`Hello, ${$data.name}!`)
   */
  En
], pn = (e) => {
  D(on, (t) => g(e[jr], t));
};
export {
  qa as bindDirective,
  _a as dataDirective,
  Aa as forDirective,
  Ia as htmlDirective,
  wa as idDirective,
  Ha as ifDirective,
  ya as ignoreDirective,
  za as intersectionDirectives,
  nn as maskDirective,
  Ja as modelDirective,
  Tn as newApp,
  ja as onDirective,
  Ga as resizeDirectives,
  ga as scriptDirective,
  pn as setAllDirectives,
  un as setup,
  ka as showDirective,
  La as styleDirective,
  Ua as teleportDirective,
  ma as templateDirective,
  Ma as transitionDirective
};
//# sourceMappingURL=briojs.2.0.0.js.map
