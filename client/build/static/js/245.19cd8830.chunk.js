"use strict";(self.webpackChunkclient=self.webpackChunkclient||[]).push([[245],{7245:function(i,e,n){n.r(e),n.d(e,{Home:function(){return Z},default:function(){return w}});var t=n(1413),a=n(885),l=n(2791),s=n(1354),r=n(6015),d=n(4565),o=n(7205),u=n(2455),v=n(1245),c=n(184),h=(0,v.Z)((0,c.jsx)("path",{d:"m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"}),"ArrowForward"),m=n(2009),f=n(2426),x=n.n(f),p=n(8687),b=n(8068),y=n(7495),j=n(647),D=n(2703),g=(0,u.Z)((function(i){return{lastsyncedData:{marginBottom:30,"&>div":{"&>h6":{marginRight:5}}},filesList:{"&>div":{padding:20,borderRadius:10,border:"2px solid ".concat(i.palette.primary.main),marginBottom:20,"&>div":{margin:"5px 0","&>h6":{marginRight:5},"&>p":{}}}}}}));function Z(i){var e,n,u,v,f=i.getDashboardOverviewData,p=i.dashboardOverview,b=i.subscriptionDetails,Z=g(),Y=(0,l.useState)({label:"",value:0}),w=(0,a.Z)(Y,2),_=w[0],I=w[1];return(0,l.useEffect)((function(){f()}),[]),(0,l.useEffect)((function(){var i;if(null!==b&&void 0!==b&&null!==(i=b.data)&&void 0!==i&&i.length){var e,n=(null===b||void 0===b||null===(e=b.data)||void 0===e?void 0:e.filter((function(i){return"publisher"===(null===i||void 0===i?void 0:i.subscription_type)}))[0])||null;n&&I({label:"".concat((0,D.NU)(parseInt(n.current_num_daily_hashes)),"/").concat((0,D.NU)(parseInt(n.num_daily_hashes))),value:100*parseInt(n.current_num_daily_hashes)/parseInt(n.num_daily_hashes)})}}),[b]),(0,c.jsxs)(s.uT,{children:[(0,c.jsxs)(r.Z,{display:"flex",alignItems:"center",justifyContent:"space-between",sx:{mb:3},children:[(0,c.jsx)(d.Z,{variant:"h3",sx:{textTransform:"capitalize"},children:"Document Authenticator Dashboard"}),(null===b||void 0===b||null===(e=b.subscriptionList)||void 0===e?void 0:e.includes("verifier"))&&(0,c.jsx)(m.rUS,{to:"/document-verification",underline:"none",children:(0,c.jsx)(o.Z,{endIcon:(0,c.jsx)(h,{}),variant:"contained",children:"Go To Document Verifier"})})]}),(0,c.jsxs)(r.Z,{display:"flex",flexDirection:"column",className:Z.lastsyncedData,children:[(0,c.jsxs)(r.Z,{display:"flex",alignItems:"center",justifyContent:"flex-start",children:[(0,c.jsx)(d.Z,{variant:"h6",children:"Last synced:"}),(0,c.jsx)(d.Z,{variant:"body2",children:x()(null===p||void 0===p||null===(n=p.data)||void 0===n?void 0:n.lastSyncedDate).format("MM/DD/YYYY hh:mm A")})]}),(0,c.jsxs)(r.Z,{display:"flex",alignItems:"center",justifyContent:"flex-start",children:[(0,c.jsx)(d.Z,{variant:"h6",children:"Total Files:"}),(0,c.jsx)(d.Z,{variant:"body2",children:null===p||void 0===p||null===(u=p.data)||void 0===u?void 0:u.totalFiles})]})]}),(0,c.jsxs)(r.Z,{sx:{my:2},children:[(0,c.jsx)(d.Z,{variant:"h6",sx:{mb:1},children:"Your today's document publish limit overview"}),(0,c.jsx)(s.YX,(0,t.Z)({},(0,t.Z)({loading:null===b||void 0===b?void 0:b.isLoading},_)))]}),(0,c.jsx)(y.Z,{tableTitle:"Synced Files",headCells:j.H,rows:null===p||void 0===p||null===(v=p.filteredFiles)||void 0===v?void 0:v.map((function(i){var e,n,t;return{fileName:null===i||void 0===i?void 0:i.fileName,fileSize:null===i||void 0===i||null===(e=i.state)||void 0===e?void 0:e.size,filePath:null===i||void 0===i?void 0:i.path,created:x()(null===i||void 0===i||null===(n=i.state)||void 0===n?void 0:n.birthtime).format("MM/DD/YYYY hh:mm A"),modified:x()(null===i||void 0===i||null===(t=i.state)||void 0===t?void 0:t.mtime).format("MM/DD/YYYY hh:mm A")}})),tableId:"syncedFilesFilter",isLoading:null===p||void 0===p?void 0:p.isLoading})]})}var Y={getDashboardOverviewData:b.dg},w=(0,p.$j)((function(i){var e=i.reducer;return{dashboardOverview:e.dashboardOverview,subscriptionDetails:e.subscriptionDetails}}),Y)(Z)}}]);
//# sourceMappingURL=245.19cd8830.chunk.js.map