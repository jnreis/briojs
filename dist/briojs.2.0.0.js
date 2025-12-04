let rl = "brio", At = "$", st = "$for", Gl = "$ref", Vl = "$slot", yr = "$store", ot = "after", cl = "append", Tt = "array", ne = "attr", Ei = "Attribute", Nr = "a valid", q = "b-", Ar = "b-for", we = "b-if", Or = "b-ignore", oi = "b-ref", _r = "b-save", sl = "b-show", Sr = "b-slot", Xt = "before", gs = "body", fl = "boolean", wr = "can only be used on", Ir = "Cannot ", be = "checkbox", lt = "checked", xs = "Child", Pr = "class", mr = "clone", Ti = "composi", ui = "content", Cr = "Content", jt = "create", qt = "data", El = "debounce", Dr = "detail", $i = "default", dr = "define", v = "delete", je = "directive", Kl = "disconnect", Ls = "display", pi = "document", Ue = "element", al = "email", gr = "end", Ui = "entries", Mi = "error", Fi = "event", xr = "EventListener", Lr = "exit", qe = "get", $r = "head", Bi = "href", hi = "html", Ri = "HTML", ml = "hydrate", Ur = "index", $s = "inner", Us = "insert", Cl = "Invalid", Xl = "length", Mr = "mask", Ms = "message", Fs = "method", ie = "must be", me = `
`, ft = "newValue", Bs = "name", ol = "Node", ut = "nodes", Fr = "not found.", Ot = null, Z = "number", _t = "object", Br = "observe", dt = "oldValue", yi = "on-", vi = yi + "enter", Hi = yi + Lr, Yi = yi + "resize", vs = "once", Ni = "operation", Be = "options", Hs = "outer", Dl = "parent", ki = "patch", Ys = "post", jl = "prepend", vr = "prevent", Hr = "Propert", Qe = Hr + "y", Me = "props", Yr = "put", Wi = "radio", Ye = "remove", Ai = "replace", kr = "require", Tl = "route", re = "script", J = "skip", Q = "select", se = "state", Wr = "start", Oi = "storage", xe = "string", ee = "style", ks = "super", zr = "teleport", Re = "template", Ae = "text", zi = "throttle", _i = "tion", Ws = "toString", at = "transition", Gr = "type", oe, Vr = "update", zs = "valid", $ = "value", Si = "With", Gs = "add" + xr, Ht = At + qt, Qt = "$de" + ml, Jt = At + ml, dl = At + Us, ul = At + Me, ze = q + qt, Kr = q + hi, wi = q + re, gl = q + Re, Vs = q + Ae, Xr = xs + "ren", jr = Pr + "List", Ks = mr + ol, pl = Ti + "ng", Xs = Ti + _i + Wr, js = Ti + _i + gr, qs = jt + "Comment", Qs = jt + "Element", ql = dr + Qe, Js = dr + Hr + "ies", rt = "de" + ml + Xr, Gi = v + Qe, qr = je + "s", Zs = "ends" + Si, Zt = "func" + _i, bs = qe + Ei, ef = qe + Qe + "Value", tf = qe + Qe + "Priority", Vi = $r + "ers", $t = $s + Ri, Y = "in" + Yr, Ut = "of " + Gr, Qr = Hs + Ri, Jr = "Own" + Qe, lf = Dl + ol, hl = "path" + Bs, rf = vr + "Default", Zr = "proto" + Gr, sf = Ye + Ei, ff = Ye + xr, af = Ye + Qe, Mt = Ai + Si, gt = Ai + Xr, Ii = kr + "s", nf = kr + "d", Ki = Tl + "Rule", Yl = Q + "ionStart", br = Q + "or", cf = "set" + Ei, Ef = "set" + Qe, of = Wr + "s" + Si, Tf = Oi + "Area", ce = "tar" + qe, it = Ae + "area", Ge = Ae + Cr, uf = zs + "ate", pf = "async" + Zt, es = qe + Jr + "Descriptor", hf = es + "s", Rf = "has" + Jr, yf = br + "Text", ts = (e, t, l, i) => `the ${e} ${t} ${Ii} ${l}, ` + xl(i), xl = (e) => `but got ${e} instead.`, Ql = Ii + " a reactive " + $, D = (e, ...t) => e.push(...t), Nf = (e, t) => e.sort(t), Te = (e, t) => e.join(t), m = (e, t) => e.forEach(t), Fe = (e, t, l) => e.map(t, l), Ft = (e, t, l) => e.filter(t, l), Pi = (e, t, l) => e.find(t, l), mi = (e, t, l) => e.every(t, l), ls = (e, t, l) => e.some(t, l), Af = (e, t, l) => e.indexOf(t, l), Of = (e, t) => t[1] - e[1], Ve = (e) => Array.from(e), Xi = (e, t = 0) => Fe(Ve({ [Xl]: e }), (l, i) => t + i), k = (e) => e.trim(), Ie = (e) => e.toLowerCase(), Ee = (e, t, l) => e.split(t, l), _f = (e, t) => e.match(t), is = (e) => e.toUpperCase(), Sf = (e) => is(e[0]) + Ne(e, 1), wf = (e) => Ie(e[0]) + Ne(e, 1), Ke = (e, t, l) => e[of](t, l), Jl = (e, t, l) => e[Zs](t, l), X = (e, t) => t.test(e), Xe = (e, t, l) => e[Ai](t, l), Zl = (e, t, l) => {
  for (; X(e, t); )
    e = Xe(e, t, l);
  return e;
}, If = (e) => X(e, /^\d+$/), rs = (e) => X(k(e), /^((async\s+)?function\s*\([^)]*\)\s*{[^}]*}|(async\s*)?(?:\([^()]*\)|[$\w]+)\s*=>)/), Pf = (e) => wf(Te(Fe(Ee(e, "-"), Sf), "")), ss = (e) => JSON.stringify(e), Ci = (e, t) => {
  try {
    e = JSON.parse(e, t);
  } catch {
  }
  return e;
}, Ll = (e) => "`" + e + "`", he = (...e) => Te(e, " "), Ce = (e) => Ie(Ne(_e[Zr][Ws].call(e), 8, -1)), Je = (e, t) => Ce(e) === t, te = (e) => e === Ot, Yt = (e) => e === oe, z = (e) => Je(e, _t), F = (e) => Je(e, Tt), Oe = (e) => mf(e) || Cf(e), mf = (e) => Je(e, Zt), Cf = (e) => Je(e, pf), B = (e) => Je(e, xe), De = (e) => Je(e, Z) && !isNaN(e), Df = (e) => Je(e, fl), df = (e) => St(e, fs), St = (e, t) => e instanceof t, nt = (e) => St(e, Node), gf = (e) => St(e, Text), de = (e) => St(e, HTMLElement), bl = (e) => St(e, Map), ei = (e) => St(e, Set), Le = window, _e = Object, mt = Reflect, Rl = location, wt = Le[pi], xf = Symbol, fs = RegExp, G = (e, t) => _e[Zr][Rf].call(e, t), Pe = (e, t, l) => {
  let i = l;
  try {
    i = t in e ? e[t] : l;
  } catch {
  }
  return i;
}, Ze = (e, t) => delete e[t], Lf = [
  ["w", "writable"],
  ["e", "enumerable"],
  ["c", "configurable"]
], W = (e, t, l = oe, i = "") => {
  if (B(i)) {
    let r = i;
    i = { [$]: l }, m(Lf, ([a, s]) => {
      i[s] = !U(r, a);
    });
  }
  _e[ql](e, t, i);
}, ct = (e) => C(ye(e)), ye = (e) => _e.keys(e), $f = (e = Ot) => _e[jt](e), Uf = (e, t = {}) => {
  const l = $f(e);
  return _e[Js](
    l,
    _e[hf](t)
  ), l;
}, Mf = (e, t, l = _e) => l[es](e, t), Ff = (e) => _e.getPrototypeOf(e), Di = (e, t = {}) => {
  m(ye(e), (l) => {
    W(e, l, e[l], t);
  });
}, as = (e) => m(ye(e), (t) => {
  Ze(e, t);
}), pe = (e = oe) => new Map(e), $l = (e = oe) => new Set(e), Bf = (e, t) => new fs(e, t), Bt = (e, t) => {
  if (e === t) return e;
  if (F(e) && F(t)) {
    for (; C(e) > C(t); ) e.pop();
    for (let l = 0; l < C(t); l++)
      l < C(e) ? e[l] = Bt(e[l], t[l]) : e.push($e(t[l]));
  } else if (bl(e) && bl(t)) {
    let l = pe(e);
    e.clear();
    for (let [i, r] of ve(t))
      e.set(i, l.has(i) ? Bt(l.get(i), r) : $e(r));
  } else if (ei(e) && ei(t)) {
    e.clear();
    for (let l of t)
      e.add(l);
  } else if (z(e) && z(t)) {
    let l = { ...e };
    as(e);
    for (let i in t)
      G(t, i) && (e[i] = G(l, i) ? Bt(l[i], t[i]) : $e(t[i]));
  } else
    return t;
  return e;
}, $e = (e) => {
  let t = e;
  if (z(e)) {
    let l = {};
    for (let i in e)
      G(e, i) && (l[i] = $e(e[i]));
    t = l;
  }
  return F(e) && (t = Fe(e, $e)), bl(e) && (t = pe(Fe(Ve(ve(e)), ([l, i]) => [l, $e(i)]))), ei(e) && (t = $l(Fe(Ve(e), $e))), t;
}, U = (e, t, l) => e.includes(t, l), ve = (e) => z(e) ? _e[Ui](e) : e[Ui](), Ne = (e, t, l) => e.slice(t, l), C = (e) => Yt(e[Xl]) ? e.size : e[Xl], bt = (e, t = 0) => setTimeout(e, t), vf = (e) => {
  clearTimeout(e);
}, yl = (e, t) => {
  let l;
  return (...i) => {
    vf(l), l = bt(() => e(...i), t);
  };
}, Hf = (e, t) => {
  let l = 0;
  return (...i) => {
    let r = Date.now();
    if (!(r - l < t))
      return l = r, e(...i);
  };
}, ji = {}, qi = (e) => Ne(Xe(crypto.randomUUID(), /-/g, ""), 0, e - 1), Nl = (e = 8) => {
  let t = qi(e);
  for (; t in ji; ) t = qi(C(t) + 1);
  return ji[t] = !0, "b" + t;
}, ns = (e, ...t) => console[e]("Brio.js", ...t), It = (...e) => ns("warn", "warn:", me, ...e), M = (...e) => ns(Mi, `detected an ${Mi}:`, me, ...e), di = (e, t = wt) => Ve(t.querySelectorAll(e)), fe = (e, t = wt) => B(e) ? di(e, t)[0] : e, Se = (e, t, ...l) => e[t](...l), cs = (e) => e[Ks](!0), Es = (e, t) => m(Ve(e.attributes), ({ name: l, [$]: i }) => t(l, i)), pt = (e) => e[Ye](), Al = (e) => e[lf], os = (e) => k(e[Ge] || ""), nl = (e) => [...e.childNodes], j = (e, t) => e[bs](t), gi = (e, t, l, i) => {
  i && (e[i] = l), e[cf](t, l);
}, Ul = (e, t) => e[sf](t), Ts = (e, ...t) => e[jr].add(...t), Yf = (e, ...t) => e[jr][Ye](...t), Qi = requestAnimationFrame, ht = (e) => Qi(() => Qi(e)), ti = (e, t) => wt[Qs](e, t), xi = (e) => wt[qs](e), He = (e) => Ie(e.tagName || ""), ae = (e, t, l, i) => (e = fe(e), e[Gs](t, l, i), () => e[ff](t, l)), We = (e, t, l) => fe(e).dispatchEvent(new CustomEvent(Ie(Xe(t, /[^a-z\d]/gi, "")), {
  bubbles: !0,
  cancelable: !0,
  [Dr]: l
})), Ol = async (e, t, l = !1) => {
  if (await t(e))
    for (let i of nl(l && He(e) == Re ? e[ui] : e))
      await Ol(i, t, l);
}, kf = (e) => e[ce][pl] = !0, Wf = (e) => {
  let t = e[ce];
  t[pl] && (t[pl] = !1, We(t, Y));
}, zf = (e) => Le.getComputedStyle(e), Gf = (e) => {
  let t = zf(e);
  return !(!Al(e) || t[Ls] == "none" || t.visibility == "hidden" || t.opacity == "0");
}, kt = (e = "", t = Bi) => new URL(e, Rl[Bi])[t], us = (e) => Ke(kt(e), Rl.origin), ps = (e) => U(["src", $, lt, Q + "ed"], e), Vf = (e) => Xe(Xe(e, /[^\w-]/g, ""), /^[^a-z_]+/i, ""), Kf = (e) => {
  let t = {};
  for (let l of e)
    t[l] = e[ef](l), e[tf](l) == Sl && (t[l] += " !" + Sl);
  return t;
}, _l = (e) => {
  let t = {}, l = {};
  for (let i in e)
    (Ke(i, at) ? t : l)[i] = e[i];
  return [t, l];
}, Sl = "important", Xf = (e, t, l) => {
  let i = "";
  Jl(l + "", "!" + Sl) && (l = k(Ne(l, 0, -10)), i = Sl), e[ee][Ef](t, l, i);
}, jf = (e, t) => {
  e[ee][af](t);
}, Wt = (e, ...t) => {
  for (let l of t)
    for (let i in l)
      Xf(e, i, l[i]);
}, wl = (e, ...t) => {
  for (let l of t)
    for (let i in l)
      jf(e, i);
}, Il = (e, t, l = !0) => new Function(e, l ? `return(${t})` : t), hs = (e, t = "", l = !0) => (Qf(e) && !l && (e += `(${t})`), rs(e) || (e = Vt(e), e = `(${t})=>` + (l ? `(${e})` : `{${e}}`)), e), qf = /^\s/, Ji = /^[a-z_$][\w$]*/i, Zi = /^\[[^\]]*\]/, bi = /^\([^\)]*\)/, Qf = (e) => {
  if (e = k(e), !e || Ke(e, v + " ")) return !1;
  let t = C(e), l = 0;
  for (let i = 0; i < t; i++) {
    let r = Ne(e, i), a = 0, s, n = l != 0 && l != 4;
    if (X(r, qf))
      continue;
    if (!n && X(r, Ji))
      a = 1, s = Ji;
    else if (n && X(r, Zi))
      a = 2, s = Zi;
    else if (n && X(r, bi))
      a = 3, s = bi;
    else if (n && Ke(r, "."))
      a = 4, s = /^\./;
    else return !1;
    let f = _f(r, s);
    i += C(f[0]) - 1, l = a;
  }
  return l == 1 || l == 2;
}, er = (e) => `only supports ${Te(Ne(e, 0, -1), ", ")}, and ${e[C(e) - 1]} insertions`, Jf = (e) => async (t, l, i, r) => {
  let a = dl + ":", s = l == Ae ? Ge : l, n = [Xt, ot, jl, cl, Mt, gt, Ae], f = () => ls(n, (g) => g == l);
  if (!f())
    return M(a, er(n));
  let c = fe(t);
  if (!nt(c))
    return M(a, ce, ie, Ut, ol);
  if (fe(hi) == c)
    return M(a, ce, "cannot be the", Ri, Ue);
  if (n = [gt, jl, cl], (fe($r) == c || fe(gs) == c) && !f())
    return M(a, is(He(c)), Ue, er(n));
  i = await i;
  let T = e[Re];
  i in T && (i = T[i]);
  let o = s == Ge, R = i, A = !1;
  if (!o && B(i) && (R = ti("div"), R[$t] = k(i), A = !0), !o && !nt(R))
    return M(a, ui, ie, Ut, ol, "or", xe);
  let h = Pe(r, br);
  if (!o && h && B(h) && (R = fe(h, R), !nt(R)))
    return M(a, Ue, Fr);
  let [x, w] = e.bnode, d = {};
  if (!o) {
    let g = {}, V = j(R.children[0], q + Me);
    V && (g = Il("", V)() || {});
    let O = [];
    for (let I in g) {
      let P = g[I], y = P, E = !1, p = !1, u;
      z(P) && (y = P.type, E = !!P[nf], u = P.warn, p = !!P.isText), F(y) || (y = [y]);
      let N = j(c, I);
      Ul(c, I), p && N && (N = Ll(N)), B(N) && (N = Il("", N || "true")());
      let S = te(N) || Yt(N);
      if (U(y, Ce(N)) || (E && S ? D(O, "Missing required prop: " + I + ".") : D(O, he(Cl, "prop type for", I + ":", ie, Ut, Te(y, " or ") + ",", xl(Ce(N))))), Oe(u)) {
        let _ = u(N, I);
        _ && D(O, _);
      }
      if (S && $i in P) {
        let _ = P[$i];
        N = Oe(_) && !U(y, Zt) ? _() : _;
      }
      d[I] = N;
    }
    m(O, (I) => It(I, c));
  }
  if (ct(d)) {
    let g = w(c);
    g.ctx[ul] = d;
  }
  let H = e.gc[Qt];
  if (s == Mt) await H(c, !1);
  else if (o || s == gt)
    for (let g of nl(c)) await H(g, !1);
  let le = A ? nl(R) : [R];
  if (Se(c, o ? gt : s, ...le), o && (le = nl(c)), m(le, (g) => {
    let V = [];
    He(g) == re ? D(V, g) : de(g) && D(V, ...di(re, g)), m(V, (O) => {
      if (mi([wi, Or, _r, Sr], (I) => te(j(O, I)))) {
        let I = ti(re);
        Es(O, (P, y) => gi(I, P, y, ps(P) && P)), I[$t] = O[$t], Se(O, Mt, I);
      }
    });
  }), Pe(r, ml, !0))
    for (let g of le) {
      if (de(g)) {
        let V = x(g, c);
        await Bl(V);
      }
      await e.gc[Jt](g, c);
    }
  return le;
}, kl = (e, t = "", l = "") => {
  let i = t == qt ? FormData : URLSearchParams, r = new i(), a = (s, n = "") => {
    z(s) || F(s) ? m(ve(s), ([f, c]) => {
      let T = n ? `${n}[${f}]` : f;
      a(c, T);
    }) : r[cl](n, s);
  };
  return a(e, l), r;
}, Ct = (e) => async (t, l, i = {}) => {
  let r = "status", a = Cr + "-Type", s = Pe(i, "parser");
  if (z(l)) {
    let n = i[Vi] || {}, f = Pi(ye(n), (T) => Ie(T) == Ie(a)), c = Ie(n[f] || "");
    Ze(n, f), e == qe || e == v ? (t += kl(l), l = oe) : Jl(c, "json") ? (l = ss(l), n[a] = "application/json") : Jl(c, "form-data") ? l = kl(l, qt) : l = kl(l), i[Vi] = n;
  }
  try {
    let n = await fetch(t, { ...i, [Fs]: e, body: l }), f = await n[s || Ae]();
    if (!s)
      try {
        f = Ci(f);
      } catch {
      }
    if (!n.ok) {
      let c = new Error(`HTTP ${n[r]}! Status text: ` + n.statusText);
      throw c.response = n, c[ui] = f, c;
    }
    return f;
  } catch (n) {
    throw n;
  }
}, li = {
  get: Ct(qe),
  post: Ct(Ys),
  put: Ct(Yr),
  [ki]: Ct(ki),
  [v]: Ct(v)
}, Zf = (e, t) => [
  // Set a route
  (l, i) => {
    if (Oe(i)) {
      l = kt(l, hl);
      let r = Ft(Ee(l, "/"), k), a = C(r) - 1, s = e;
      m(r, (n, f) => {
        n in s || (s[n] = {}), s = s[n], f == a && (s[Lt] = i);
      });
    } else M(Ir, "set route without a", Tl, Zt, me, l);
  },
  /**
   * Get a route function by path.
   * 
   * @returns The route function, or `undefined` if not found, or `null` if not the same origin
   */
  (l) => {
    if (!us(l))
      return Ot;
    l = kt(l, hl);
    let i = Ft(Ee(l, "/"), k), r = e, a = {}, s = 0;
    for (let n of i) {
      if (s = 0, n in r && !Ke(n, ":"))
        r = r[n], s = 1;
      else for (let f of ye(r))
        if (Ke(f, ":")) {
          let [c, T] = Ft(Ee(f, ":"), k);
          if (!T || T && T in t && t[T](n)) {
            let o = a[c];
            o ? F(o) ? D(o, n) : a[c] = [o, n] : a[c] = n, r = r[f], s = 1;
            break;
          }
        }
      if (!s) break;
    }
    if (s = s && r[Lt] ? 1 : 0, s)
      return () => r[Lt]({
        params: a,
        path: l,
        [Ye]: () => Ze(r, Lt)
      });
  }
], Rs = (e, t) => {
  e = kt(e, hl), t && us(e) ? (t(), e != Rl[hl] && history.pushState(Ot, "", e)) : Rl.href = e;
}, bf = (e) => Li(({ [se]: t, prop: l }) => (Gt(t)[J].add(l), e)), ii = !1, ri = [], ys = (e) => (ri = [], ii = !0, e({}), ii = !1, [...ri]), Ns = (e) => {
  let t = ys(e), l = C(t), [i, r] = t[l - 1] || [];
  return [i, r];
}, ue = (e, t) => {
  if (!tr(e) || Rt(e)) return e;
  let l = {
    get(s, n) {
      return ii && (G(s, n) || !(n in s)) && D(ri, [i, n]), mt.get(s, n, i);
    },
    set(s, n, f) {
      n in s || W(s, n);
      let c = i[n];
      if (c === f) return !0;
      let T = Gt(i), o = {
        [ce]: s,
        [se]: i,
        prop: n,
        [dt]: c
        // [NEW_VALUE]: newValue,
        // [OPERATION]: UNDEFINED,
      };
      Di(o, "wc"), xt.has(f) && (xt[v](f), f = f(o)), r.has(n) || (f = ue(f)), o[ft] = f, ea(o);
      let R = mt.set(s, n, f, i);
      return lr(T, o), R;
    },
    [Gi](s, n) {
      let f = s[n], c = mt[Gi](s, n);
      return lr(Gt(i), {
        [ce]: s,
        [se]: i,
        prop: n,
        [dt]: f,
        [ft]: oe,
        [Ni]: v
      }), c;
    },
    [ql](s, n, f) {
      let c = f[$], T = i[n];
      return xt.has(c) && (f[$] = c({ [se]: i, prop: n, [ft]: c, [dt]: T })), !r.has(n) && $ in f && (f[$] = ue(f[$])), mt[ql](s, n, f);
    }
  };
  const i = new Proxy(Rt(t) && z(t) ? Uf(t, e) : e, l), r = $l();
  let a = {
    // [PARENT]: parent,
    // [TARGET]: target,
    // proxied,
    [se]: pe(),
    [Me]: {},
    skip: r
    // refs: [],
    // [ON_SET]: {},
  };
  Ml.set(i, a);
  for (let s in e) {
    let n = e[s];
    xt.has(n) && (n = n({
      [ce]: e,
      [se]: i,
      prop: s,
      [dt]: oe
    })), !r.has(s) && tr(n) && mt.set(e, s, n, i);
  }
  return i;
}, tr = (e) => F(e) || z(e), lr = (e, t) => {
  let l = pe(), i = e[Me][t.prop];
  i && m(i, (a, s) => l.set(s, a)), m(e[se], (a, s) => l.set(s, a));
  let r = Ve(l);
  Nf(r, Of);
  for (let [a] of r) a(t);
}, ea = (e) => {
  e[Ni] = Yt(e[dt]) ? jt : Yt(e[ft]) ? v : Vr;
}, As = "getItem", Os = "setItem", si = pe(), ta = (e) => {
  let t = Ff(e);
  return t && G(t, As) && G(t, Os);
}, fi = (e, t) => Ci(e[As](t) || ""), ir = (e, t, l) => e[Os](t, ss(l)), rr = (e) => "_b_" + e, _s = (e, t, l) => ta(e) ? (l && (l = rr(l), G(e, l) && (t = fi(e, l))), Li(({ [se]: r, prop: a }) => (si.set(l, [r, a, e]), l = l || rr(a), G(e, l) ? t = fi(e, l) : ir(e, l, t), bt(() => vt(r, a, () => {
  ir(e, l, r[a]);
})), t))) : M(Cl, Oi, _t), la = (e) => {
  if (si.has(e.key)) {
    let [t, l, i] = si.get(e.key);
    i === e[Tf] && (t[l] = fi(i, e.key));
  }
}, zt = (e, t, l = 0) => {
  let i = [], r = ys(t || e);
  return m(r, ([a, s]) => {
    D(i, ws(a, s, e, l));
  }), t && e({}), () => m(i, (a) => a());
}, vt = (e, t, l, i = 0) => {
  let r;
  return Rt(e) ? B(t) || De(t) ? r = ws(e, t, l, i) : r = Ss(e, l, i) : (M(Ir + `watch non-${se} ${_t}/${Tt}.`), r = () => {
  }), r;
}, Ml = pe(), xt = $l(), Li = (e) => xt.add(e) && e, Rt = (e) => Ml.has(e), Gt = (e) => Ml.get(e), ai = (e) => Ml[v](e), Ss = (e, t, l = 0) => {
  if (Rt(e)) {
    let i = Gt(e)[se];
    return i.set(t, l), () => i[v](t);
  }
}, ws = (e, t, l, i = 0) => {
  let r = Gt(e)[Me];
  r[t] || (r[t] = pe()), r[t].set(l, i);
  let a = e[t], s;
  return Rt(a) && (s = Ss(a, l, i)), () => {
    s && s(), r[t][v](l);
  };
};
W(ue, "persist", (e, t) => _s(localStorage, e, t), "wc");
W(ue, "session", (e, t) => _s(sessionStorage, e, t), "wc");
W(ue, "init", Li, "wc");
W(ue, J, bf, "wc");
let Wl = "required", sr = "matches", fr = "\\p{L}", ia = "\\p{Nd}", ra = Bf(Zl(Zl("^(?!.*\\.{2})[w._%+-]+@(?:[w](?:[w-]*[w])?\\.)+[l]{2,}$", /w/, fr + ia), /l/, fr), "u"), sa = (e, t, l, i) => {
  let r = {};
  e || (e = {});
  let a = (f, c, T) => {
    let o = !1;
    return (B(f) || F(f)) && (o = T ? C(f) >= c : C(f) <= c), De(f) && (o = T ? f >= c : f <= c), o;
  }, s = {
    [Wl]: (f) => !!f || f === 0,
    min: (f, c) => a(f, c, !0),
    max: (f, c) => a(f, c, !1),
    [al]: (f) => B(f) && X(f, ra),
    same: (f, c, T) => f === T[c],
    in: (f, c) => F(c) && U(c, f),
    [sr]: (f, c) => B(f) && X(f, c),
    type: (f, c) => s.in(Ce(f), F(c) ? c : [c]),
    // Note that custom rules can override default rules
    ...l || {}
  }, n = {
    [Wl]: (f) => he(f, "is", Wl + "."),
    min: (f, c) => he(f, ie, "at least", c + "."),
    max: (f, c) => he(f, ie, "at most", c + "."),
    [al]: (f) => he(f, ie, Nr, al + "."),
    same: (f, c) => he(f, "must match", c + "."),
    in: (f, c) => he(f, ie, "equal to", Te(c, " or ") + "."),
    [sr]: (f) => f + " has an invalid format.",
    type: (f, c) => he(f, ie, Ut, (F(c) ? Te(c, " or ") : c) + "."),
    // Note that custom messages can override default messages
    ...i || {}
  };
  for (let [f, c] of ve(t || {})) {
    let T = e[f];
    for (let [o, [R, A]] of ve(c)) {
      let h = s[o];
      h ? h(T, R, e) || (r[f] || (r[f] = []), A ? D(r[f], A) : D(r[f], n[o](f, R, e) || f + " is invalid.")) : It("Unknown rule: " + o);
    }
  }
  return !ct(r) || r;
}, Lt = xf(rl), Is = [];
$l();
let un = () => {
  let e = (E) => o.get(E), t = (E, p = () => !0) => {
    let u = E ? Al(E) : Ot;
    for (; u; ) {
      let N = e(u);
      if (N && p(N)) return N;
      u = Al(u);
    }
  }, l = (E, p) => {
    let u = e(E);
    if (!u) {
      let N = p && e(p) || t(p || E);
      u = {
        // Local context
        // @ts-ignore
        ctx: { ...I },
        // A reference to the element. Convenience for internal use.
        el: E,
        [Dl]: N,
        // Unique ID context
        id: Pe(N, "id", {}),
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
        [J]: 0,
        ...y
      };
      for (let S in H) {
        let _ = H[S](u, N);
        _ && W(u.ctx, S, _, "c");
      }
      o.set(E, u), u[Be] = na(u, q + Be)(u.ctx);
    }
    return u;
  }, i = async (E, p) => {
    B(E) && (E = fe(E)), B(p) && (p = fe(p)), nt(p) || (p = oe), nt(E) && (await n(E), await Ol(E, async (u) => {
      let N = !1, S = E == u ? p : oe;
      return gf(u) && os(u) ? N = a(u, S) : de(u) && (He(u) == re && te(j(u, wi)) ? N = !1 : N = await s(u, S)), N;
    }));
  }, r = async (E, p = !0, u = !0) => {
    await Ol(E, async (N) => {
      let S = e(N);
      if (S) {
        if (S[ut])
          for (let _ of S[ut])
            await r(_, p, u);
        if (S[rt])
          for (let _ of S[rt])
            await r(_, p, u);
        S.ph && pt(S.ph), m(S.cFns, (_) => _()), u && o[v](N);
      }
      return p && pt(N), !0;
    });
  }, a = (E, p) => {
    let u = E[Ge], N = oa(Vt(u || ""));
    if (N && X(N, ca)) {
      let S = l(E, p), _ = T(S, Ll(N));
      L(S, zt(() => E[Ge] = _(S.ctx))), ni(S, Ae, u);
    }
    return !1;
  }, s = async (E, p) => {
    let u = l(E, p);
    if (ge(u, 3)) return !0;
    for (let [N, S] of R) {
      let _ = [];
      if (df(N))
        Es(E, (K, el) => {
          X(K, N) && D(_, [K, el]);
        });
      else {
        let K = j(E, N);
        te(K) || D(_, [N, K]);
      }
      for (let [K, el] of _) {
        if (ge(u, 1) || ge(u, 3)) break;
        ni(u, K, el), await S(u, K, Vt(el));
      }
      if (ge(u, 1) || ge(u, 3)) break;
    }
    return ge(u, 0) && (u[J] = 1), ct(u[ne]) || o[v](E), !ge(u, 2) && !ge(u, 3);
  }, n = async (E) => {
    let p = await Ps(E, _r, []);
    m(p, ([u, N]) => {
      let S = He(N), _ = S != re && S != ee ? Re : S, K = N[_ == Re ? Qr : $t];
      y[_][u] = k(K);
    });
  }, f = (E) => (p, u) => {
    y[E][p] = u;
  }, c = (E, p, u = "", N = !0, S = !0) => {
    let _;
    return p = hs(S ? Ra(E, p) : p, u, N), p in d ? _ = d[p] : (_ = Nl(), w[_] = Il(vl(E, p), p), d[p] = _), _;
  }, T = (E, p, u = "", N = !0, S = !0) => {
    let _;
    try {
      let K = p in w ? p : c(E, p, u, N, S);
      _ = w[K](E.ctx);
    } catch (K) {
      M(K[Ms]), _ = () => Lt;
    }
    return _;
  }, o = pe(), R = [], A = {}, h = {}, x = { [Z]: If }, w = {}, d = {}, H = {
    // The $data context
    [Ht]: Ta(Ht, ze),
    // Reactive properties defined in the element or inherited from the parent context
    [ul]: (E, p) => (p == null ? void 0 : p.ctx[ul]) || {},
    // The $for context
    [st]: (E, p) => p == null ? void 0 : p.ctx[st],
    // Data Level Context:
    // Referenced under the same $data context, not including nested $data contexts
    [Gl]: ar(Gl),
    [Vl]: ar(Vl),
    // The element itself
    $el: (E) => E.el,
    // Unique identifier for the element
    $id: (E) => E.id,
    $cleanup: (E) => (p) => L(E, p)
  }, [le, g] = Zf(h, x), V = (E) => Rs(E, g(E)), O = {
    [Tl]: le,
    [Ki]: f(Ki + "s"),
    [Re]: f(Re),
    [ee]: f(ee),
    [re]: f(re),
    [Me]: f(Me),
    data: f(qt)
  }, I = {
    [yr]: ue({}),
    $set: O,
    [Jt]: i,
    [Qt]: r
  }, P = {
    http: li,
    state: ue,
    watch: vt,
    effect: zt,
    [Tl]: V,
    emit: We,
    listen: ae,
    /** Get the local context of an element */
    context: (E) => {
      var p;
      return (p = e(fe(E))) == null ? void 0 : p.ctx;
    },
    // Tools
    hasProp: G,
    getProp: Pe,
    setProp: W,
    sync: Bt,
    [mr]: $e,
    [uf]: sa,
    uid: Nl,
    getType: Ce
  };
  m(ye(P), (E) => I[At + E] = P[E]);
  let y = {
    [Re]: A,
    [ee]: {},
    [re]: {},
    [Me]: {},
    data: {},
    // ! HYDRATION
    [qr]: R,
    bnodes: o,
    routes: h,
    routeRules: x,
    // ! PUBLIC CONTEXT
    gc: I,
    exec: T,
    bnode: [l, e]
  };
  return I[dl] = Jf(y), D(Is, g), m([O, li, I, y], (E) => Di(E, "wc")), y;
}, ge = (e, t) => e[J] == t, L = (e, t) => {
  D(e.cFns, t);
}, yt = (e, t) => {
  let l = e[Dl];
  l && (l[rt] || (l[rt] = []), U(l[rt], t) || D(l[rt], t));
}, fa = (e) => Pi(Nt(e), (t) => Al(t)), Nt = (e) => {
  let t = [], [, l] = e.bnode;
  return e.ph && D(t, e.ph), m(e[ut] || [e.el], (i) => {
    let r = l(i);
    r && G(r.attr, gl) ? D(t, ...Nt(r)) : D(t, i);
  }), t;
}, aa = (e) => {
  m(Nt(e), (t) => {
    t != e.ph && pt(t);
  });
}, na = (e, t, l = {}) => {
  let i = () => l, r = de(e.el) ? j(e.el, t) : null;
  return te(r) || ni(e, t, r), r && k(r) && (r = Vt(r), i = e.exec(e, r, vl(e, r))), i;
}, ni = (e, t, l) => {
  e[ne][t] = l, de(e.el) && Ul(e.el, t);
}, Vt = (e) => Xe(Te(Fe(Ee(e, me), (t) => Ke(k(t), "//") ? "" : t), me), /;$/, ""), ca = /\${((?!.*\${).*?)}/, Ea = /{{((?!.*{{).*?)}}/, oa = (e, t = "${$1}") => Zl(e, Ea, t), Ta = (e, t, l) => (i, r) => {
  let a = i.el, s = r ? r.ctx[e] : Ot, n = de(a), f = n && !te(j(a, t)), c = n && (i[ne][we] || !te(j(a, we))), T = n && (!s || f);
  return T && !f && t == ze && gi(a, ze, ""), T && !c ? ue({}, l) : s || {};
}, ar = (e) => (t, l) => !l || de(t.el) && !te(j(t.el, ze)) ? {} : l.ctx[e], ua = () => {
  let e = kt();
  Rs(e, Pi(Is, (t) => t(e)));
}, pn = (e = {}) => {
  rl in Le || (Di(e, "wc"), W(Le, rl, e, "wc"), ae(Le, Oi, la), ae(Le, "pop" + se, ua)), We(Le, rl);
}, Fl = (e) => (e.match(/^(b-\w+|bind|on)(-([\w-$]+))?$/) || [])[3] || "", Bl = async (e) => {
  await nr(e, Sr), await nr(e, oi);
}, nr = async (e, t) => {
  let l = t == oi, i = e.ctx[l ? Gl : Vl], r = l ? [
    /*B_IF,*/
    Ar,
    gl,
    ze
  ] : [ze];
  for (let a of e[ut] || [e.el]) {
    let s = await Ps(a, t, r);
    m(s, ([n, f]) => {
      i[n] = l ? f : f[Qr], L(e, () => Ze(i, n));
    });
  }
}, Ps = async (e, t, l) => {
  let i = [], r = t != oi;
  return await Ol(e, (a) => {
    if (de(a)) {
      if (ls(l, (n) => !te(j(a, n)))) return !1;
      let s = j(a, t);
      s && (Ul(a, t), D(i, [s, a]), r && pt(a));
    }
    return !0;
  }, r), i;
}, vl = (e, t) => "{" + Te(Ft(ye(e.ctx), (l) => U(t, l)), ",") + "}", pa = (e, t) => {
  for (let l of [st, Ht, ul, yr]) {
    let i = e.ctx[l];
    if (i && t in i) {
      t = l + "." + t;
      break;
    }
  }
  return t;
}, ha = new RegExp("(?<![.`'\"][\\w\\s$]*)[a-z_$][\\w$]*(?![\\w\\s$]*[:`'\"{])", "i"), Ra = (e, t) => {
  let l = 0, i = "", r;
  for (; (r = ha.exec(Ne(t, l))) !== null; ) {
    let a = r[Ur], s = r[0], n = pa(e, s);
    i += Ne(t, l, l + a) + n, l += a + C(s);
  }
  return i + Ne(t, l);
}, Pt = (e, t, l) => {
  let i = e.exec(e, t);
  L(e, zt(() => l(i)));
}, ms = (e, t, l) => {
  let i = [];
  return l && (l in t ? D(i, t[l]) : (l = e.exec(e, l)(), F(l) && m(l, (r) => {
    r in t && D(i, t[r]);
  }))), i;
}, ya = async (e, t) => {
  e[J] = 3;
}, Na = [Or, ya], cr = /^[a-z_$][\w$]*$/i, Aa = (e, t, l) => {
  let i = e.el, [r, a] = e.bnode;
  e[J] = 3;
  let [s, n] = Fe(Ee(l, " in "), k), [f, c] = Fe(Ee(s, ","), k);
  c || (c = Ur);
  let T = he("the", t, je, Ii);
  if (!X(f, cr) || !X(c, cr))
    return M(T, Nr, "alias.");
  let o = e.exec(e, n), [R, A] = Ns(o), h = R ? R[A] : o(), x = R && Rt(h), w = !1;
  if (De(h) && (h = ue(Xi(h, 1)), w = !0, R && zt(() => {
    let O = R[A] || 0;
    De(O) && Bt(h, Xi(O, 1));
  }, () => R[A])), !(F(h) || z(h)))
    return M(T, `an ${Tt}, ${_t}, or ${Z}.`);
  e.ph = xi(t), Se(i, Mt, e.ph), yt(e, i);
  let d = {}, H = async ([O, I]) => {
    let P = cs(i);
    Se(e.ph, Xt, P);
    let y = r(P, i);
    y[ne][t] = "", G(e[ne], we) && (y[ne][we] = "");
    let E = ue({}, y.ctx[st]);
    W(E, f, I, "c"), W(E, c, O, "c"), W(y.ctx, st, E, "c"), L(y, () => {
      ai(E);
    }), L(y, vt(E, c, ({ [ft]: p }) => {
      let u = d[O][1];
      p !== u && (E[c] = u);
    })), x && L(y, vt(E, f, () => {
      h[E[c]] = E[f];
    })), d[O] = [P, O], await Bl(y), await e.gc[Jt](P, i);
  }, le = ([O, I]) => {
    let P = d[O], y = a(P && P[0]);
    if (y) {
      let E = y.ctx[st];
      E[f] = I, E[c] = O, P[1] = O;
    }
  }, g = ([O, I]) => {
    let [P] = d[O];
    e.gc[Qt](P), Ze(d, O);
  }, V = {
    [jt]: H,
    [Vr]: le,
    [v]: g
  };
  for (let O of ve(h))
    H(O);
  R && L(e, vt(h, oe, ({ [Ni]: O, prop: I, [ft]: P }) => {
    V[O]([I, P]);
  })), L(e, () => {
    for (let O in d)
      g([Number(O), null]);
    w && ai(h);
  });
}, Oa = [Ar, Aa], _a = async (e, t, l) => {
  let i = e[Dl] || e, r = e.data[l];
  !Oe(r) && l && (r = e.exec(i, l, vl(e, l)));
  let a = Oe(r) ? await r(i.ctx) : {};
  if (!z(a))
    return e[J] = 3, M(ts(je, t, "an " + _t, Ce(a)));
  for (let s in a) W(e.ctx[Ht], s, a[s], Mf(a, s));
  await Bl(e), L(e, () => {
    bt(() => {
      ai(e.ctx[Ht]);
    });
  });
}, Sa = [ze, _a], Er = {}, wa = async (e, t, l) => {
  if (l) {
    let i = e.exec(e, l)();
    if (!F(i) || !mi(i, B))
      return M("the", t, je, ie, `an ${Tt} of ${xe}(s).`);
    e.id = i.reduce((r, a) => {
      let s = Nl(5);
      return Er[s] = !0, W(r, a, s, "wc"), r;
    }, {}), L(e, () => {
      for (let r in e.id) Ze(Er, e.id[r]);
    });
  }
}, Ia = ["b-id", wa], Cs = (e) => (t, l, i) => {
  if (!(G(t[ne], gl) || G(t[ne], Kr) && e == Ae)) {
    t[J] = 2;
    let r = t[Re];
    i in r && (i = Ll(i)), i && Pt(t, i, async (a) => {
      await t.gc[dl](t.el, e, a()), t[J] = 3;
    });
  }
}, Pa = [Kr, Cs(gt)], ma = [Vs, Cs(Ae)], Ca = async (e, t, l) => {
  let i = e.el, r = l ? e[Re][l] || e.exec(e, l)() : i[$t];
  e[J] = 2, B(r) ? (e[ut] = await e.gc[dl](i, Xt, k(r)), yt(e, i), pt(i)) : It(t + ":", Cl, $, me, r);
}, Da = [gl, Ca], da = async (e, t, l) => {
  let i = e.el;
  e[J] = 2;
  let r = ms(e, e[re], l);
  if (He(i) == re) {
    yt(e, i);
    let a = j(i, "src"), s = a ? await li.get(a) : os(i);
    s && D(r, Vt(s)), pt(i);
  }
  for (let a of r) {
    let s = a;
    if (B(s)) {
      let n = rs(s);
      s = Il(vl(e, s), s, n), n && (s = s(e.ctx));
    }
    Oe(s) && await s(e.ctx);
  }
}, ga = [wi, da], xa = (e, t, l) => {
  let i = e.el;
  if (l && He(i) != ee) {
    let r = ms(e, e[ee], l), a = Nl();
    Ts(i, a);
    let s = ti(ee);
    Se(i, ot, s), s[Ge] = Te(r, me), s[Ge] = La(s, "." + a), e.gc[Jt](s, i), L(e, () => {
      e.gc[Qt](s);
    });
  }
}, La = (e, t) => {
  var i;
  let l = [];
  for (let r of ((i = e.sheet) == null ? void 0 : i.cssRules) || []) {
    let a = r[yf];
    D(l, Xe(r.cssText, a, t + " " + a));
  }
  return Te(l, me);
}, $a = [q + ee, xa], Ua = (e, t, l) => {
  let i = l, r, a = e.ctx.$ref;
  i in a && (i = Ll(i)), Pt(e, i, (s) => {
    i = s(), F(i) && ([i, r] = i), B(i) && i in a && (i = a[i]), U([Xt, ot, jl, cl], r) || (r = ot), nt(i) ? (Se(i, r, ...Nt(e)), yt(e, e.el)) : It(zr, Ue, Fr, t + `="${l}"`);
  });
}, Ma = [q + zr, Ua], Pl = pe(), Fa = (e, t, l) => {
  if (e[ut]) return;
  if (!(G(e[ne], we) ? we : G(e[ne], sl) ? sl : ""))
    return M("the", t, je, ie, "used with", we, "or", sl + ".");
  let r = e.exec(e, l)();
  F(r) || (r = [r]);
  let [a, s] = r;
  if (!z(a))
    return M("the", t, ie, "an", _t + ".");
  z(s) || (s = a);
  let n = va(e.el, a, s);
  Pl.set(e.el, n), L(e, n[Ye]), L(e, () => Pl[v](e.el));
}, Ba = [q + at, Fa], or = (e, t, l, i) => {
  let [r, a] = _l(t), [s, n] = _l(l);
  wl(e, a, r, s), Wt(e, n, i ? { [at]: "none" } : {}), ht(() => {
    Wt(e, s), wl(e, n);
  });
}, Tr = (e, t, l) => {
  let [i, r] = _l(t), [a, s] = _l(l);
  wl(e, r, i), Wt(e, s, a);
}, ur = () => (/* @__PURE__ */ new Date()).getTime(), va = (e, t, l) => {
  if (!de(e))
    return M(Cl, at, Ue, e);
  let i = null, r = 1, a = 2, s = 3, n = 4, f = r, c = Kf(e[ee]), T = 0, o = ae(e, at + "run", (w) => {
    w[ce] === e && (T = ur());
  }), R, A = ae(e, at + gr, (w) => {
    w[ce] === e && (f == a ? f = n : f == s && (f = r), wl(e, t, l), Wt(e, c), R && R());
  }), h = () => {
    o(), A();
  }, x = (w, d) => {
    R = d;
    let H = ur();
    w && i && f == n || !w && i === !1 && f == n || (w ? i === !1 && f == a ? (f = s, or(e, t, l)) : (or(e, l, t, f == r), i = !0, f = a) : i === null ? (i = !1, f = n, R && R()) : i && f == a ? (f = s, Tr(e, l, t)) : (i = !1, f = a, Tr(e, t, l)), bt(() => {
      T < H && R && R();
    }, 50));
  };
  return W(x, Ye, h), x;
}, Ha = (e, t, l) => {
  let i = e.el;
  e.ph = xi(t), Se(i, Mt, e.ph), e[J] = 3, yt(e, i);
  let [r] = e.bnode, a, s, n = () => {
    e.gc[Qt](a.el), a = oe;
  };
  Pt(e, l, (f) => {
    let c = f();
    ht(async () => {
      if (c) {
        if (!a) {
          let T = cs(i);
          Se(e.ph, ot, T), a = r(T, i), a[ne][we] = "", await Bl(a), await e.gc[Jt](T, i), yt(e, T);
        }
        s = Pl.get(a.el), s && s(!0);
      } else !c && a && (s ? s(!1, n) : n());
    });
  });
}, Ya = [we, Ha], Dt = pe(), ka = (e, t, l) => {
  e.ph = xi(t), Se(fa(e), Xt, e.ph);
  let i, r = () => {
    aa(e), Dt.set(e.ph, e);
  };
  Pt(e, l, (a) => {
    let s = a();
    ht(() => {
      let n = Nt(e);
      if (i = Pl.get(e.el), s) {
        if (Dt.has(e.ph)) {
          for (let f of n)
            if (Dt.has(f) && f !== e.ph) {
              let c = Dt.get(f), T = Nt(c);
              n = Ft(n, (o) => !U(T, o) || o === c.ph);
            }
          Dt[v](e.ph), Se(e.ph, ot, ...n);
        }
        i && i(!0);
      } else i ? i(!1, r) : r();
    });
  });
}, Wa = [sl, ka], tl = (e, t, l) => {
  let i = Fl(t), [r] = Ee(i, "-"), a = e[Be][t] || {}, s = e.el, n = e.exec(e, l, "$entry", !1), f = yl(n, a[El] || 100), c = new IntersectionObserver((T) => {
    m(T, (o) => {
      o.isIntersecting != (r == Lr) && (f(o), a[vs] && c[Kl]());
    });
  }, a);
  c[Br](s), L(e, () => c[Kl]());
}, za = [
  [vi, tl],
  [q + vi, tl],
  [Hi, tl],
  [q + Hi, tl]
], pr = (e, t, l) => {
  let i = Fl(t);
  Ee(i, "-");
  let r = e.el, a = e[Be][t] || {}, s = a[pi] ? fe(hi) : r, n = e.exec(e, l, "$size", !1), f = yl(n, a[El] || 100), c = new ResizeObserver((T) => {
    let o = T[0].borderBoxSize[0];
    f([o.inlineSize, o.blockSize]);
  });
  c[Br](s, a), L(e, () => c[Kl]());
}, Ga = [
  [Yi, pr],
  [q + Yi, pr]
], et = "keyup", tt = "keydown", hr = "outside", Va = "window", Ds = "control", ci = "meta", ll = "arrow", Rr = [
  ci,
  Ds,
  "shift",
  "alt",
  "fn"
], Ka = {
  ctrl: Ds,
  cmd: ci,
  [ks]: ci,
  esc: "escape",
  del: v,
  up: ll + "up",
  down: ll + "down",
  left: ll + "left",
  right: ll + "right"
}, Xa = (e, t, l) => {
  let i = Fl(t), [r, ...a] = Ee(i, "-"), s = e.el, n = s, f = (h) => {
    let x = e.exec(e, l, At + Fi, !1);
    Oe(x) ? x(h) : M(ts(Fi, t, "a " + Zt, Ce(x())));
  }, c = e[Be][t] || {};
  m(a, (h) => {
    c[h] = !0;
  }), El in c && (f = yl(f, c[El])), zi in c && (f = Hf(f, c[zi])), c[hr] || c[pi] ? n = wt : c[Va] && (n = Le);
  let T = {};
  U([tt, et], r) && m(Pe(c, "keys", []), (h) => {
    T[Ka[h] || h] = !0;
  });
  let o = ct(T), R = r;
  if (U([tt, et], r) && o) {
    let h = {};
    r = t;
    let x = yl((w) => {
      We(n, r, w);
    }, 600);
    L(e, ae(n, tt, (w) => {
      let d = Ie(w.key);
      h[d] || (h[d] = !0), bt(() => {
        h.meta && !U(Rr, d) && zl(w, h);
      });
      let H = ye(h);
      o > 1 && et == R && h.meta && !U(Rr, d) ? x(H) : tt == R && We(n, r, H);
    })), L(e, ae(n, et, (w) => {
      tt == R && zl(w, h), We(n, r, ye(h)), et == R && zl(w, h);
    })), L(e, ae(n, "focus", () => {
      as(h);
    }));
  }
  L(e, ae(n, r, (h) => {
    if (c[vr] && h[rf](), c.stop && h.stopPropagation(), !(c.self && h[ce] !== h.currentTarget) && !(c[hr] && (s.contains(h[ce]) || !Gf(s)))) {
      if (U([tt, et], R)) {
        let x = h[Dr];
        if (!(ct(T) == ct(x) && mi(ye(T), (w) => U(x, w))))
          return;
      }
      f(h);
    }
  }, c));
}, zl = (e, t) => Ze(t, Ie(e.key)), ja = [/^(b-on|on)-([\w-$]+)$/, Xa], qa = (e, t, l) => {
  let i = e.el, r = Fl(t), a = hs(l || Pf(r), "$initial");
  r = Vf(r);
  let s = j(i, r), n = e[Be][t] || {};
  Pt(e, a, (f) => {
    if (!f)
      return It(l, Ql, xl(t + `="${l}"`), me, i);
    let c = f(s || ""), T = n.prop || ps(r) && r;
    if (c || T)
      if (r == ee && z(c))
        Wt(i, c);
      else if (r == Pr && z(c))
        for (let o in c)
          c[o] ? Ts(i, o) : Yf(i, o);
      else
        gi(i, r, !T && c === !0 ? "" : c, T);
    else Ul(i, r);
  });
}, Qa = [/^(b-bind|bind)-([\w-$]+)$/, qa], il = pe(), Ja = (e, t, l) => {
  let i = he("the", t, je), r = Q + "ed", a = t + `="${l}"`, s = e.el, n = He(s), f = s.type;
  if (!U([Y, it, Q], n))
    return M(i, wr, Y, `, ${it}, and ${Q} ${Ue}s.`, a, s);
  let [c, T] = Ns(e.exec(e, l));
  if (!c)
    return M(i, Ql, a, s);
  let o = c[T], R, A = () => Ve(n == Q ? s[Be] : H()), h = e[Be][t] || {}, x = (y) => {
    let E = y[te(j(y, $)) && d ? lt : $], p = il.get(y) || h;
    if (B(E) && (p.trim && (E = k(E)), !p.raw)) {
      let u = Ci(E);
      (De(u) || te(u) || Df(u)) && (E = u);
    }
    return E;
  }, w = (y) => n == Y && U(y, f), d = w([be, Wi]), H = () => di(Y + `[type="${be}"][name="${s.name}"]`), le = () => w(be) && C(H()) > 1, g = () => {
    let y = [
      [Y, be, [Z, xe, fl, Tt]],
      [Y, Wi, [Z, xe, fl]],
      [Y, Z, [Z]],
      [Y, "range", [Z]],
      [Y, "", [Z, xe]],
      [it, "", [Z, xe]],
      [Q, "", [Z, xe, fl, Tt]]
    ];
    for (let [E, p, u] of y)
      if (n == E && (!p || f == p)) {
        te(o) || Yt(o) || U(u, Ce(o)) || It(i, Ql, Ut, Te(u, " or "), `for ${n == Y ? f + " " : ""}${E} ${Ue}s,`, xl(Ce(o)), a, s);
        break;
      }
  };
  ht(() => {
    g(), Q == n ? m(A(), (y) => il.set(y, h)) : w(be) && il.set(s, h);
  });
  let V = () => {
    if (o = c[T], R = x(s), U([Y, it], n))
      if (f == be && F(o))
        s[lt] = U(o, R);
      else if (d)
        s[lt] = o === R;
      else {
        if (s[pl] || wt.activeElement === s && o === R) return;
        o !== R && (s[$] = o);
      }
    else n == Q && (F(o) ? m(A(), (y) => {
      y[r] = U(o, x(y));
    }) : s[$] = o);
  };
  ht(() => L(e, zt(V)));
  let O = {}, I = () => {
    if (o = c[T], n == Q && s.multiple || le()) {
      let y = [];
      m(A(), (E) => {
        n == Q && il.set(E, h), (E[r] || E[lt]) && D(y, x(E));
      }), c[T] = y;
    } else c[T] = d && !s[lt] ? !1 : x(s);
  };
  (w([Ae, "search", "url", "tel", al, "password"]) || n == it) && (O[Xs] = kf, O[js] = Wf);
  let P = h.lazy || d || n == Q ? "change" : Y;
  O[P] = I;
  for (let [y, E] of ve(O))
    L(e, ae(s, y, E));
}, Za = ["b-model", Ja], b = "output", ke = "cursor", Et = ke + "Updated", ba = "updateCursor", en = (e, t, l) => {
  let i = e.el;
  if (!($ in i && Yl in i))
    return M("the", t, je, wr, it, Ue + "s and textual", Y, "types (text, email, etc.).");
  let r = {
    exp: e.exec(e, l, "$mask"),
    [$]: "",
    [ke]: i[Yl],
    [ba]: Kt,
    [Et]: !1,
    [b]: "",
    char: Hl,
    letter: an,
    [Z]: ds,
    alpha: nn,
    money: sn
  }, a = () => {
    r[$] = i[$], r[$] != r[b] && (r[ke] = i[Yl], tn(r), i[$] = r[b], i.setSelectionRange(r[ke], r[ke]), We(i, Mr, r));
  };
  ht(a), L(e, ae(i, Y, a, !0));
}, tn = (e) => {
  e[Et] = !1, e[b] = "";
  let t = e.exp(e);
  if (Oe(t)) {
    t(e);
    return;
  }
  let l = e[$], i = 0, r = C(l);
  m([...t], (a, s) => {
    B(a) && C(a) > 1 && t.splice(s, 1, ...Ee(a, ""));
  });
  for (let [a, s] of ve(t)) {
    if (i >= r) break;
    if (F(s)) {
      let n = 0, [f, c, T] = s;
      for (; i < r && n < T; ) {
        if (f(l[i]))
          n++, e[b] += l[i];
        else {
          let o = !1, R, A = a;
          for (; A > -1 && (R = ln(t, A + 1)); ) {
            if (rn(R, l, i)) {
              o = !0;
              break;
            }
            A = Af(t, R, A);
          }
          if (o && n >= c) break;
        }
        i++, Kt(e, i);
      }
    } else B(s) && (e[b] += s, l[i] == s && i++, Kt(e, i));
  }
}, ln = (e, t) => {
  for (let l = t; l < C(e); l++) {
    let i = e[l];
    if (F(i))
      return i;
  }
}, rn = (e, t, l) => {
  let i = !1;
  if (F(e)) {
    let [r, a, s] = e;
    if (Oe(r) && De(a) && De(s)) {
      let n = 0, f = C(t);
      for (let c = l; c < f && n < s; c++)
        r(t[c]) && n++;
      i = n > 0 && n >= a;
    }
  }
  return i;
}, sn = (e = {}) => (t) => {
  let l = t[$], i = C(l), r = Pe(e, "thousands", ","), a = Pe(e, "decimal", "."), s = Pe(e, "precision", 2);
  a == "," && (r = "."), r == "." && (a = ",");
  let n = !1, f = !1, c = [], T = [], [o] = ds();
  for (let A = 0; A < i; A++)
    l[A] == "-" ? !C(c) && !C(T) && (n = !0) : f ? C(T) < s && o(l[A]) && D(T, A) : l[A] == a ? f = !0 : o(l[A]) && (C(c) == 1 && l[c[0]] == "0" ? c[0] = A : D(c, A));
  t[b] = n ? "-" : "";
  let R = C(c);
  t[Et] = !1;
  for (let A = 0; A < R; A++)
    A > 0 && (R - A) % 3 == 0 && (t[b] += r), t[b] += l[c[A]], Kt(t, c[A] + 1);
  t[b] += f ? a : "";
  for (let A = 0; A < C(T); A++)
    t[b] += l[T[A]], Kt(t, T[A] + 1);
  return t;
}, Kt = (e, t) => {
  if (!e[Et]) {
    let l = e[ke];
    l == 0 ? e[Et] = !0 : l <= t && (e[Et] = !0, e[ke] = C(e[b]));
  }
}, fn = (e = 1, t = 1) => (e = De(e) && e >= 0 ? e : 1, t = De(t) && t > e ? t : e > 0 ? e : 1, [e, t]), Hl = (e, t, l) => [B(e) ? (r) => r == e : (r) => X(r, e), ...fn(t, l)], an = (e, t) => Hl(new RegExp("\\p{L}", "u"), e, t), ds = (e, t) => Hl(new RegExp("\\p{Nd}", "u"), e, t), nn = (e, t) => Hl(/[\p{L}\p{Nd}]/u, e, t), cn = [q + Mr, en], En = async (e, t, l) => {
  Pt(e, l, (i) => {
    let r = i();
    Oe(r) && r();
  });
}, on = ["b-effect", En], Tn = [
  /**
   * The b-ignore directive is used to stop the hydration of the element and its children.
   */
  Na,
  /**
   * Conditional hydration
   * Notes:
   * - b-if stops the hydration flow of the element and starts a new hydration flow with a copy of the element whenever the condition evaluates to true
   * - the original element is replaced with a placeholder comment node to hold its location in the DOM
   * - whenever the condition evaluates to false, the copy of the element is dehydrated and removed from the DOM
   */
  Ya,
  /**
   * Data context
   * Notes:
   * - the order of inference is: $for, $data, $props, $store
   * - b-slot and b-ref are hydrated after b-data
   */
  Sa,
  /** List rendering
   * Notes:
   * - b-for stops the hydration flow of the element and starts a new hydration flow for each item it creates
   */
  Oa,
  /**
   * Unique ID generator
   */
  Ia,
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
  Da,
  /**
   * Conditional display
   * Notes:
   * - the element is hydrated regardless of the condition
   * - the b-show directive toggles the `display` of the element based on the condition
   */
  Wa,
  // ['b-boost', hydrateBoost],
  Ba,
  // b-transition, b-transition-play, b-transition-reverse
  /**
   * The b-teleport moves the element to a different location in the DOM.
   * Notes:
   * - b-teleport also works with the b-if and b-template directives
   */
  Ma,
  /**
   * Dynamic hydration of HTML or text content and styles
   * Notes:
   * - if the element has a b-html and b-text directive, the b-html directive is hydrated and the b-text directive is ignored
   * - b-style always hydrates regardless of the b-html and b-text directives
   */
  Pa,
  ma,
  /**
   * Dynamic insertion of styles
   * Notes:
   * - the style element is inserted after the element that contains the b-style directive
   */
  $a,
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
  on
], hn = (e) => {
  m(Tn, (t) => D(e[qr], t));
};
export {
  Qa as bindDirective,
  Sa as dataDirective,
  Oa as forDirective,
  Pa as htmlDirective,
  Ia as idDirective,
  Ya as ifDirective,
  Na as ignoreDirective,
  za as intersectionDirectives,
  cn as maskDirective,
  Za as modelDirective,
  un as newApp,
  ja as onDirective,
  Ga as resizeDirectives,
  ga as scriptDirective,
  hn as setAllDirectives,
  pn as setup,
  Wa as showDirective,
  $a as styleDirective,
  Ma as teleportDirective,
  Da as templateDirective,
  Ba as transitionDirective
};
//# sourceMappingURL=briojs.2.0.0.js.map
