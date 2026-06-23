propagationTypeListFiltered = computed(() => {
  const showLbo = this.counterpartyDetail?.lboFinFlag === true && this.isFinancingTypeLBO();
  return showLbo ? this.propagationTypeList.slice(3, 4) : this.propagationTypeList.slice(0, 3);
});
