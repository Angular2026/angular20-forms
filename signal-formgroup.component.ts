V1.0.242__add_pgnnr_adjusted_data_facility_borrowers.sql


ALTER TABLE facility_borrowers ADD COLUMN IF NOT EXISTS archived_counterparty_rating VARCHAR(50) NULL;
ALTER TABLE facility_borrowers ADD COLUMN IF NOT EXISTS adjusted_counterparty_rating VARCHAR(50) NULL;
ALTER TABLE facility_borrowers ADD COLUMN IF NOT EXISTS archived_su_grr_percentage NUMERIC(9,4) NULL;
ALTER TABLE facility_borrowers ADD COLUMN IF NOT EXISTS adjusted_su_grr_percentage NUMERIC(9,4) NULL;
ALTER TABLE facility_borrowers ADD COLUMN IF NOT EXISTS adjusted_data_comment TEXT NULL;


@Column(name = "archived_counterparty_rating")
private String archivedCounterpartyRating;

@Column(name = "adjusted_counterparty_rating")
private String adjustedCounterpartyRating;

@Column(name = "archived_su_grr_percentage")
private BigDecimal archivedSuGrrPercentage;

@Column(name = "adjusted_su_grr_percentage")
private BigDecimal adjustedSuGrrPercentage;

@Column(name = "adjusted_data_comment")
private String adjustedDataComment;




archivedCounterpartyRating = FacilityBorrower.archivedCounterpartyRating;
adjustedCounterpartyRating = FacilityBorrower.adjustedCounterpartyRating;
archivedSuGrrPercentage = FacilityBorrower.archivedSuGrrPercentage;
adjustedSuGrrPercentage = FacilityBorrower.adjustedSuGrrPercentage;
adjustedDataComment = FacilityBorrower.adjustedDataComment;






archivedCounterpartyRating = builder.archivedCounterpartyRating;
adjustedCounterpartyRating = builder.adjustedCounterpartyRating;
archivedSuGrrPercentage = builder.archivedSuGrrPercentage;
adjustedSuGrrPercentage = builder.adjustedSuGrrPercentage;
adjustedDataComment = builder.adjustedDataComment;








private String archivedCounterpartyRating;
private String adjustedCounterpartyRating;
private BigDecimal archivedSuGrrPercentage;
private BigDecimal adjustedSuGrrPercentage;
private String adjustedDataComment;

public Builder archivedCounterpartyRating(String v) { this.archivedCounterpartyRating = v; return this; }
public Builder adjustedCounterpartyRating(String v) { this.adjustedCounterpartyRating = v; return this; }
public Builder archivedSuGrrPercentage(BigDecimal v) { this.archivedSuGrrPercentage = v; return this; }
public Builder adjustedSuGrrPercentage(BigDecimal v) { this.adjustedSuGrrPercentage = v; return this; }
public Builder adjustedDataComment(String v) { this.adjustedDataComment = v; return this; }





private String archivedCounterpartyRating;
private String adjustedCounterpartyRating;
private BigDecimal archivedSuGrrPercentage;
private BigDecimal adjustedSuGrrPercentage;
private String adjustedDataComment;




