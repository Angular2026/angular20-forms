save
export interface SponsorEntity {
  adjustedSponsorTurnover?:                SponsorAmount;
  adjustedSponsorTurnoverClosingDate?:     Date;
  adjustedSponsorTurnoverOverrideComment?: string;
  assetsUnderManagement?:                  SponsorAmount;
  assetsUnderManagementClosingDate?:       Date;
  internalRatingDetails?:                  InternalRating;
  externalRatingDetails?:                  ExternalRating;
  rmpmIdOfSponsor?:                        string;
  sponsorIdentifiedWithRmpmId?:            boolean;
  sponsorInvolvement?:                     string;
  sponsorStrength?:                        string;
  sponsorTurnover?:                        SponsorAmount;
  sponsorTurnoverClosingDate?:             Date;
  sponsorType?:                            string;
  externalSponsor?:                        ExternalSponsor; // ← à ajouter
}

export interface sponsorEntityInfo {
  adjustedSponsorTurnover:                SponsorAmount;
  adjustedSponsorTurnoverClosingDate:     Date;
  adjustedSponsorTurnoverOverrideComment: string;
  assetsUnderManagement:                  SponsorAmount;
  assetsUnderManagementClosingDate:       Date;
  internalRatingDetails:                  InternalRating;
  externalRatingDetails:                  ExternalRating;
  rmpmIdOfSponsor:                        SponsorCounterparty;
  sponsorIdentifiedWithRmpmId:            boolean;
  sponsorInvolvement:                     string;
  sponsorStrength:                        string;
  sponsorTurnover:                        SponsorAmount;
  sponsorTurnoverClosingDate:             Date;
  sponsorType:                            string;
  externalSponsor?:                       ExternalSponsor; // ← à ajouter
}




export interface ExternalSponsor {
  sponsorName?:                           string;
  hasExternalRating?:                     boolean;
  commentOnExternalData?:                 string;
  externalRatingDetails?:                 ExternalRating;
  sponsorType?:                           string;
  sponsorTurnover?:                       SponsorAmount;
  sponsorTurnoverClosingDate?:            Date;
  adjustedSponsorTurnover?:               SponsorAmount;
  adjustedSponsorTurnoverClosingDate?:    Date;
  adjustedSponsorTurnoverOverrideComment?: string;
  assetsUnderManagement?:                 SponsorAmount;
  assetsUnderManagementClosingDate?:      Date;
  sponsorInvolvement?:                    string;
  sponsorStrength?:                       string;
}


public record ExternalSponsorDto(
    String sponsorName,
    Boolean hasExternalRating,
    String commentOnExternalData,
    SponsorExternalRatingDetailsDto externalRatingDetails,
    String sponsorType,
    SponsorMonetaryDto sponsorTurnover,
    LocalDate sponsorTurnoverClosingDate,
    SponsorMonetaryDto adjustedSponsorTurnover,
    LocalDate adjustedSponsorTurnoverClosingDate,
    String adjustedSponsorTurnoverOverrideComment,
    SponsorMonetaryDto assetsUnderManagement,
    LocalDate assetsUnderManagementClosingDate,
    String sponsorInvolvement,
    String sponsorStrength
) {}



@DomainDrivenDesign.ValueObject
@Builder(toBuilder = true)
public record ExternalSponsor(
    String sponsorName,
    Boolean hasExternalRating,
    String commentOnExternalData,
    SponsorExternalRating externalRatingDetails,
    String sponsorType,
    SponsorMonetary sponsorTurnover,
    LocalDate sponsorTurnoverClosingDate,
    SponsorMonetary adjustedSponsorTurnover,
    LocalDate adjustedSponsorTurnoverClosingDate,
    String adjustedSponsorTurnoverOverrideComment,
    SponsorMonetary assetsUnderManagement,
    LocalDate assetsUnderManagementClosingDate,
    String sponsorInvolvement,
    String sponsorStrength
) {}
