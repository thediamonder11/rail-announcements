import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import StationAnnouncementSystem from '@announcement-data/StationAnnouncementSystem'
import CallingAtSelector, { CallingAtPoint } from '@components/CallingAtSelector'
import CustomAnnouncementPane, { ICustomAnnouncementPaneProps, ICustomAnnouncementPreset } from '@components/PanelPanes/CustomAnnouncementPane'
import CustomButtonPane from '@components/PanelPanes/CustomButtonPane'
import { getStationByCrs } from '@data/StationManipulators'
import crsToStationItemMapper, { stationItemCompleter } from '@helpers/crsToStationItemMapper'
import { AudioItem, CustomAnnouncementTab } from '../../AnnouncementSystem'
import FullscreenIcon from 'mdi-react/FullscreenIcon'

type ChimeType = 'three' | 'four' | 'none'

interface INextTrainAnnouncementOptions {
  chime: ChimeType
  platform: string
  hour: string
  min: string
  isDelayed: boolean
  toc: string
  terminatingStationCode: string
  vias: CallingAtPoint[]
  callingAt: CallingAtPoint[]
  coaches: string | null
}

interface IDisruptedTrainAnnouncementOptions {
  chime: ChimeType
  platform: string
  hour: string
  min: string
  toc: string
  terminatingStationCode: string
  vias: CallingAtPoint[]
  disruptionType: 'delay' | 'delayedBy' | 'cancel'
  disruptionReason: string
  delayTime: string
}

interface SplitInfoStop {
  crsCode: string
  shortPlatform: string
  requestStop: boolean
  portion: {
    position: 'any' | 'front' | 'middle' | 'rear' | 'unknown'
    length: number | null
  }
}

export default class AmeyPhil extends StationAnnouncementSystem {
  readonly NAME = 'Amey/Ditra - Phil Sayer'
  readonly ID = 'AMEY_PHIL_V1'
  readonly FILE_PREFIX = 'station/ketech/phil'
  readonly SYSTEM_TYPE = 'station'

  private readonly CALLING_POINT_DELAY = 200
  private readonly CALLING_POINT_AND_DELAY = 100

  private get announcementPresets(): Readonly<Record<string, ICustomAnnouncementPreset[]>> {
    return {
      nextTrain: [
        {
          name: '12:28 | SN Littlehampton to Brighton',
          state: {
            chime: 'four',
            platform: '2',
            hour: '12',
            min: '28',
            toc: 'southern',
            terminatingStationCode: 'BTN',
            vias: [],
            callingAt: ['ANG', 'GBS', 'DUR', 'WWO', 'WRH', 'SWK', 'PLD', 'HOV'].map(crsToStationItemMapper),
            coaches: '8 coaches',
          },
        },
        {
          name: '16:05 | SN Victoria to Portsmouth & Bognor',
          state: {
            chime: 'four',
            platform: '12',
            hour: '16',
            min: '05',
            toc: 'southern',
            terminatingStationCode: 'PMS',
            vias: [],
            callingAt: [
              'CLJ',
              'ECR',
              'GTW',
              'TBD',
              'CRW',
              {
                crsCode: 'HRH',
                splitType: 'splits' as const,
                splitForm: 'rear.4',
                splitCallingPoints: ['CHH', 'BIG', 'PUL', 'AMY', 'ARU', 'FOD', 'BAA', 'BOG'].map(crsToStationItemMapper),
              },
              'BAA',
              'CCH',
              'FSB',
              'BOH',
              'SOB',
              'EMS',
              'HAV',
              'FTN',
            ].map(stationItemCompleter),
            coaches: '8 coaches',
          },
        },
        {
          name: '17:15 | GX Brighton to London Victoria',
          state: {
            chime: 'four',
            platform: '5',
            hour: '17',
            min: '15',
            toc: 'gatwick express',
            terminatingStationCode: 'VIC',
            vias: ['GTW'].map(crsToStationItemMapper),
            callingAt: ['PRP', 'HSK', 'BUG', 'HHE', 'GTW'].map(crsToStationItemMapper),
            coaches: '8 coaches',
          },
        },
        {
          name: '11:18 | VT Euston to Edinburgh',
          state: {
            chime: 'four',
            platform: '6',
            hour: '11',
            min: '18',
            toc: 'virgin pendolino',
            terminatingStationCode: 'EDB',
            vias: ['BHM'].map(crsToStationItemMapper),
            callingAt: [
              'MKC',
              'RUG',
              'COV',
              'BHI',
              'BHM',
              'SAD',
              'WVH',
              'STA',
              'CRE',
              'WBQ',
              'WGN',
              'PRE',
              'LAN',
              'PNR',
              'CAR',
              { crsCode: 'HYM', shortPlatform: 'front.9' },
            ].map(stationItemCompleter),
            coaches: '11 coaches',
          },
        },
        {
          name: '08:20 | XC Aberdeen to Penzance',
          state: {
            chime: 'four',
            platform: '3',
            hour: '08',
            min: '20',
            toc: 'crosscountry',
            terminatingStationCode: 'PNZ',
            vias: ['LDS'].map(crsToStationItemMapper),
            callingAt: [
              'STN',
              'MTS',
              'ARB',
              'DEE',
              'LEU',
              'CUP',
              'LDY',
              'MNC',
              'KDY',
              'INK',
              'HYM',
              'EDB',
              'BWK',
              'ALM',
              'NCL',
              'DHM',
              'DAR',
              'YRK',
              'LDS',
              'WKF',
              'SHF',
              'DBY',
              'BUT',
              'BHM',
              'CNM',
              'BPW',
              'BRI',
              'TAU',
              'TVP',
              'EXD',
              'NTA',
              'TOT',
              'PLY',
              'LSK',
              'BOD',
              'SAU',
              'TRU',
              'RED',
              'SER',
            ].map(crsToStationItemMapper),
            coaches: '5 coaches',
          },
        },
        {
          // http://www.1s76.com/1S76%202008.htm
          name: '08:20 | 1O23 XC Manchester to Brighton (2008)',
          state: {
            chime: 'four',
            platform: '3',
            hour: '08',
            min: '20',
            toc: 'crosscountry',
            terminatingStationCode: 'BTN',
            vias: ['BHM', 'KPA'].map(crsToStationItemMapper),
            callingAt: ['SPT', 'MAC', 'CNG', 'SOT', 'WVH', 'BHM', 'LMS', 'BAN', 'OXF', 'RDG', 'KPA', 'ECR', 'GTW', 'HHE'].map(
              crsToStationItemMapper,
            ),
            coaches: '5 coaches',
          },
        },
        {
          name: '18:07 | Chiltern MYB - Stourbridge',
          state: {
            chime: 'four',
            platform: '2',
            hour: '18',
            min: '07',
            toc: 'chiltern railways',
            terminatingStationCode: 'SBJ',
            vias: [],
            callingAt: ['HDM', 'BCS', 'BAN', 'LMS', 'WRW', 'WRP', 'DDG', 'SOL', 'BMO', 'BSW', 'ROW'].map(crsToStationItemMapper),
            coaches: '5 coaches',
          },
        },
        {
          name: '12:50 | SN Eastbourne - Ashford',
          state: {
            chime: 'four',
            platform: '2',
            hour: '12',
            min: '50',
            toc: 'southern',
            terminatingStationCode: 'AFK',
            vias: [],
            callingAt: [
              'HMD',
              'COB',
              'PEV',
              'CLL',
              'BEX',
              'SLQ',
              'HGS',
              'ORE',
              { crsCode: 'TOK', shortPlatform: 'front.1' },
              'WSE',
              'RYE',
              { crsCode: 'APD', shortPlatform: 'front.2' },
              'HMT',
            ].map(stationItemCompleter),
            coaches: '3 coaches',
          },
        },
      ],
    }
  }

  readonly AVAILABLE_TOCS = {
    withServiceToFrom: [
      'a replacement bus',
      'additional',
      'additional Chiltern Railways',
      'additional football special',
      'Alphaline',
      'Anglia Railways',
      'Anglia Railways Train',
      'Arriva CrossCountry',
      'Arriva Trains Merseyside',
      'Arriva Trains Northern',
      'Arriva Trains Wales',
      'Blackheath and Woolwich',
      'Blackheath and Woolwich Arsenal',
      'Blackheath and Woolwich Arsenal Line',
      'c2c',
      'c2c Rail',
      'Cardiff Railways',
      'Central Trains',
      'Charter',
      'Chiltern Line',
      'Chiltern Railway Company',
      'Chiltern Railways',
      'Chiselhurst and Maidstone East',
      'Chiselhurst and Maidstone East Line',
      'Chiselhurst Sevenoaks and Canterbury West',
      'Chiselhurst Sevenoaks and Canterbury West Line',
      'Connex',
      'Connex Express',
      'Connex Metro',
      'Connex Racecourse Special',
      'Connex Rail',
      'Connex South Central',
      'Connex South Eastern',
      'Country',
      'CrossCountry',
      'diverted',
      'East Midlands',
      'East Midlands Trains',
      'Eurostar',
      'express',
      'First Capital Connect',
      'First Great Western',
      'First Great Western Adelante',
      'First Great Western Atlantic Coast Express',
      'First Great Western Bristolian',
      'First Great Western Cathedrals Express',
      'First Great Western Cheltenham Flier',
      'First Great Western Cheltenham Spa Express',
      'First Great Western Cornish Riviera',
      'First Great Western Devon Belle',
      'First Great Western Golden Hind',
      'First Great Western Hibernian',
      'First Great Western High Speed',
      'First Great Western Intercity',
      'First Great Western Link',
      'First Great Western Mayflower',
      'First Great Western Merchant Venturer',
      'First Great Western Motorail',
      'First Great Western Night Riviera',
      'First Great Western Pembroke Coast Express',
      'First Great Western Red Dragon',
      'First Great Western Royal Duchy',
      'First Great Western Royal Wessex',
      'First Great Western St David',
      'First Great Western Torbay Express',
      'First Transpennine Express',
      'First Transpennine Service',
      'football special',
      'for seat reservations holders only',
      'Gatwick Express',
      'GNER',
      'Grand Central',
      'Great Eastern',
      'Great Eastern Railway',
      'Great North Eastern Railway',
      'Great North Eastern Railways',
      'Great North Eastern Railways White Rose',
      'Great North Eastern Railways Yorkshire Pullman',
      'Great Northern',
      'Great Western',
      'Heathrow Express',
      'Holidaymaker',
      'Holidaymaker Express',
      'Hull Trains',
      'Island Line',
      'London Midland',
      'London Midland City',
      'London Midland Express',
      'London Overground',
      'London Transport Buses',
      'London Underground',
      'LTS Rail',
      'Maidstone East and Ashford International Line',
      'Maidstone East and Ashford Line',
      'Maidstone East and Canterbury West Line',
      'Maidstone East and Dover Priory Line',
      'Merseyside Electrics',
      'Midland Mainline',
      'Midland Mainline High Speed Train',
      'Midland Mainline Turbostar',
      'National Express',
      'National Express East Coast',
      'New Southern Railway',
      'New Southern Railway Brighton Express',
      'North London Railway',
      'Northern',
      'Northern Rail',
      'Northern Spirit',
      'One',
      'One Anglia',
      'Orient Express',
      'private charter train',
      'Racecourse Special',
      'replacement bus',
      'return charter train',
      'rugby special',
      'ScotRail',
      'ScotRail Railways',
      'Silverlink County',
      'Silverlink Metro',
      'South Central',
      'South Central Trains',
      'South West Trains',
      'Southeastern',
      'Southeastern Trains',
      'Southern',
      'Southern Railway',
      'Southern Railway Brighton Express',
      'special charter',
      'Stansted Express',
      'steam charter train',
      'stopping',
      'Tarka Line',
      'Thames Trains',
      'Thameslink',
      'Thameslink City Flier',
      'Thameslink City Metro',
      'The Mid Hants Steam Railway',
      'The National Express East Coast',
      // 'The Swanage Railway',
      'The Watercress Line',
      'The Yorkshire Pullman',
      'Tramlink',
      'Tyne and Wear Metro',
      'Valley Lines',
      'Virgin Pendolino',
      'Virgin Trains',
      'Virgin Trains Armada',
      'Virgin Trains Cornish Scot',
      'Virgin Trains Cornishman',
      'Virgin Trains Cross Country',
      'Virgin Trains Devon Scot',
      'Virgin Trains Devonian',
      'Virgin Trains Dorset Scot',
      'Virgin Trains Midland Scot',
      'Virgin Trains Pines Express',
      'Virgin Trains Sussex Scot',
      'Virgin Trains Wessex Scot',
      'Virgin Voyager',
      'WAGN',
      'Wales and Borders',
      'Wales and West',
      'Wales and West Alphaline',
      'Wales and West Weymouth Sand and Cycle Explorer',
      'Wessex',
      'West Anglia',
      'West Anglia Great Northern Railway',
      'West Anglia Great Northern Railways',
      'West Coast Railway Company',
      'White Rose',
      'Yorkshire Pullman',
    ],
    standaloneOnly: [
      'Channel Tunnel Rail Link',
      'Chiltern Railway company',
      'Croydon Tramlink',
      'First Transpennine',
      'intercity charter train',
      'international',
      'London North Western Railway',
      'mainline',
      'North London Railways',
      'North Western Trains',
      'Regional Railways charter train',
      'ScotRail Express',
      'South London Metro',
      'South Western Railway',
      'Sussex Scot',
      'Transpennine',
      'Transpennine Express',
      'Virgin Trains the Sussex Scot',
      'West Midlands Railway',
      'West Yorkshire metro train',
    ],
  }
  private readonly DISRUPTION_REASONS: string[] = [
    'a broken down freight train',
    'a broken down preceding train',
    'a broken down train',
    'a broken rail',
    'a cable fire',
    'a chemical spillage',
    'a currently unidentified reason which is under investigation',
    'a customer having been taken ill on a preceding train',
    'a customer having been taken ill on this train',
    'a dangerous gas leak',
    'a derailment',
    'a driver shortage',
    'a failed train',
    'a failure of level crossing apparatus',
    'a failure of signalling equipment',
    'a fallen tree on the line',
    'a fatality',
    'a fault on a level crossing',
    'a fault on a preceding that has now been rectified',
    'a fault on a preceding train',
    'a fault on the train that has now been rectified',
    'a fault on the train',
    'a fault on this train which cannot be rectified',
    'a fault on this train which is being attended to',
    'a fault on trackside equipment',
    'a fault that has occurred whilst attaching coaches to this train',
    'a fault that has occurred whilst detaching coaches from this train',
    'a fault with the door mechanism on board a preceding train',
    'a fault with the door mechanism on board this train',
    'a fire',
    'a gas leak in the area',
    'a lack of suitable carriages',
    'a landslide',
    'a landslip',
    'a late-running preceding service',
    'a lightning strike affecting the signalling equipment',
    'a lightning strike',
    'a line blockage',
    'a lineside fire',
    'a major electrical power fault',
    'a mechanical fault on a level crossing',
    'a member of staff providing assistance to a passenger',
    'a passenger incident',
    'a passenger requiring urgent attention',
    'a points failure',
    'a power failure',
    'a problem on property adjacent to the railway',
    'a report of an injury to a person on the track',
    'a road vehicle damaging a level crossing',
    'a road vehicle on the line',
    'a road vehicle striking a railway bridge',
    'a security alert',
    'a shortage of available coaches',
    'a shortage of serviceable trains',
    'a shortage of train dispatch staff',
    'a signal failure',
    'a signalling apparatus failure',
    'a slow-running preceding freight train running behind schedule',
    'a slow-running preceding train with a technical fault',
    'a staff shortage',
    'a suspected fatality',
    'a technical fault on the service',
    'a technical fault to lineside equipment',
    'a technical problem',
    'a temporary fault with the signalling equipment',
    'a temporary shortage of drivers',
    'a temporary shortage of train crews',
    'a temporary speed restriction because of signalling equipment repairs',
    'a temporary speed restriction because of track repairs',
    // 'a temporary speed restriction',
    'a ticket irregularity on board a preceding train',
    'a ticket irregularity on board this train',
    'a track circuit failure',
    'a train failure',
    'a train speed restriction caused by a technical fault on this train',
    'additional cleaning duties',
    'additional coaches being attached to the train',
    'additional maintenance requirements at the depot',
    'additional safety duties being carried out on board this train',
    'additional train movements to remove a broken down train',
    'adverse weather conditions',
    // 'after having been held awaiting late running connection (old cut)',
    // 'after having been held for a late running connection',
    'ambulance attending an incident on the train',
    'ambulance attending an incident on this train',
    'an accident on a level crossing',
    'an accident to a member of the public',
    'an act of vandalism on this train',
    'an earlier act of vandalism on this train',
    'an earlier blockage of the line',
    'an earlier broken down train causing congestion',
    'an earlier broken down train',
    'an earlier electrical power supply problem',
    'an earlier fallen tree on the line',
    'an earlier fallen tree',
    'an earlier fatality',
    'an earlier fault on a level crossing',
    'an earlier fault that occurred whilst attaching coaches to this train',
    'an earlier fault that occurred whilst detaching coaches from this train',
    'an earlier fault with the door mechanism on board a preceding train',
    'an earlier fault with the door mechanism on board this train',
    'an earlier fault with the signalling equipment',
    'an earlier landslide',
    'an earlier lineside fire',
    'an earlier road vehicle striking a railway bridge',
    'an earlier security alert',
    'an earlier trespassing incident causing congestion',
    'an earlier trespassing incident',
    'an electrical power supply problem',
    'an external cause beyond our control',
    'an incident on the line',
    'an injury to a person on the track',
    'an obstruction on the line',
    'animals on the railway line',
    'animals on the track',
    'awaiting a connecting service',
    'awaiting a member of the train crew',
    // 'awaiting a member of train crew',
    'awaiting a portion of the train',
    'awaiting a replacement driver',
    'awaiting an available platform because of service congestion',
    'awaiting replacement coaches',
    'awaiting signal clearance',
    'bad weather conditions',
    'being held awaiting a late running connection',
    'being held awaiting a replacement bus connection',
    'cancellation of the incoming service',
    'caused by servicing problems in the depot',
    'children playing near the line',
    'christmas holidays',
    'coaches being detached from this train',
    'conductor rail problems',
    'confusion caused by a fault with the station information board',
    'congestion caused by a failed train',
    'congestion',
    'crewing difficulties',
    'damaged track',
    'debris blown on the line',
    'debris on the line',
    'delay to a preceding train',
    'earlier emergency track repairs',
    'earlier engineering works',
    'earlier overrunning engineering work',
    'earlier reports of a disturbance on board this train',
    'earlier reports of animals on the line',
    'earlier reports of debris on the line',
    'earlier reports of trespassers on the line',
    'earlier vandalism',
    'electric conductor rail problems',
    'electrical problems with the train',
    'emergency engineering work',
    'emergency track repairs',
    'engineering works',
    'engineering work',
    'extreme weather conditions',
    'failure of a preceding train',
    'flooding on the line',
    'flooding',
    'fog',
    'following signal staff instructions',
    'heavy rain',
    'high winds',
    'industrial action',
    // 'large numbers of passengers alighting from the trains at',
    // 'large numbers of passengers joining the trains at',
    'late running of a previous train',
    'mechanical problems with the train',
    'mechanical problems',
    'no driver available',
    'objects being thrown onto the line',
    'objects on the line',
    'on a preceding train',
    'overcrowding caused by the short formation of this service today',
    'overcrowding caused by the',
    'overcrowding on the train',
    'overcrowding',
    'overhead electric line problems',
    'overhead line damage',
    'overhead line problems',
    'overrunning engineering work',
    'passenger illness',
    'police activity on the line',
    'police attending a disturbance on a preceding train',
    'police attending a disturbance on this train',
    'police attending an incident on the train',
    'police attending an incident on this train',
    'police persuing suspects on the line',
    'poor rail conditions caused by frost',
    'poor rail conditions caused by leaf fall',
    'poor rail conditions',
    'power car problems',
    'refueling',
    'replacing emergency equipment on this train',
    'reports of a blockage on the line',
    'reports of a disturbance on board this train',
    'reports of animals on the line',
    'reports of debris on the line',
    'reports of trespass on the line',
    'revenue protection officers attending this train',
    'severe weather conditions',
    'short formation of this train',
    'signal testing',
    'signalling difficulties',
    'signalling equipment repairs',
    'sliding train door problems',
    'slippery rail conditions',
    'snow',
    'staff shortages',
    'staff sickness',
    'suspected damage to a railway bridge by a road vehicle',
    'suspected damage to a railway bridge',
    'suspected terrorist threat',
    'the advice of the emergency services',
    'the emergency communication cord being activated on this train',
    'the emergency communication cord being activated',
    'the emergency communication cord being pulled on the service',
    'the emergency communication cord being pulled on the train',
    'the emergency cord being pulled on the service',
    'the emergency cord being pulled on the train',
    'the extreme heat',
    'the fire brigade attending an incident on the train',
    'the fire brigade attending an incident on this train',
    'the late arrival of an incoming train',
    // 'the late arrival of the coaches and train crew to form this service',
    'the late running of a preceding train',
    'the london fire brigade attending an incident on the train',
    'the london fire brigade attending an incident on this train',
    'the previous service being delayed',
    'the short formation of this train',
    'the train being diverted from its scheduled route',
    'the train running on reduced engine power',
    'the unfortunate action of vandals',
    'third rail problems',
    'this train making additional stops on its journey',
    // ['a temporary speed restriction', 'to run at a reduced speed while inspecting the line'],
    'track repairs',
    'train being held awaiting an available platform',
    'train door problems',
    'trespass on the line',
    'vandalism on a preceding train',
    'vandalism on the service',
    'vandalism',
    // 'who has been delayed by the earlier disruption',
    // 'who in turn has been delayed by the current disruption',
    // 'who is delayed on a late-running service',
  ]

  readonly ALL_AVAILABLE_TOCS = [...this.AVAILABLE_TOCS.standaloneOnly, ...this.AVAILABLE_TOCS.withServiceToFrom].sort((a, b) =>
    a.localeCompare(b),
  )

  private async getFilesForBasicTrainInfo(
    hour: string,
    min: string,
    toc: string,
    vias: string[],
    terminatingStation: string,
    callingPoints: CallingAtPoint[],
    stationsAlwaysMiddle: boolean = false,
  ): Promise<AudioItem[]> {
    const files: AudioItem[] = [`hour.s.${hour}`, `mins.m.${min}`]

    if (toc === '') {
      files.push({
        id: `m.service to`,
        opts: { delayStart: 50 },
      })
    } else {
      if (this.AVAILABLE_TOCS.standaloneOnly.some(x => x.toLowerCase() === toc.toLowerCase())) {
        files.push(
          {
            id: `toc.m.${toc.toLowerCase()}`,
            opts: { delayStart: 150 },
          },
          'm.service to',
        )
      } else {
        files.push({
          id: `toc.m.${toc.toLowerCase()} service to`,
          opts: { delayStart: 150 },
        })
      }
    }

    const dividesAt = callingPoints.find(s => s.splitType === 'splitTerminates' || s.splitType === 'splits')

    if (dividesAt && (dividesAt.splitCallingPoints?.length ?? 0) > 0) {
      const allDestinations = [terminatingStation, dividesAt.splitCallingPoints!![dividesAt.splitCallingPoints!!.length - 1].crsCode]

      files.push(
        ...this.pluraliseAudio(allDestinations, {
          prefix: 'station.m.',
          finalPrefix: stationsAlwaysMiddle ? 'station.m.' : 'station.e.',
          andId: 'm.and',
          firstItemDelay: 100,
          beforeAndDelay: 100,
          beforeItemDelay: 50,
        }),
      )
    } else {
      if (vias.length !== 0) {
        files.push(
          `station.m.${terminatingStation}`,
          'm.via',
          ...this.pluraliseAudio(
            vias.map((stn, i) => `station.${!stationsAlwaysMiddle && i === vias.length - 1 ? 'e' : 'm'}.${stn}`),
            {
              andId: 'm.and',
              beforeAndDelay: 100,
            },
          ),
        )
      } else {
        files.push(`station.${stationsAlwaysMiddle ? 'm' : 'e'}.${terminatingStation}`)
      }
    }

    return files
  }

  private async getShortPlatforms(
    callingPoints: CallingAtPoint[],
    terminatingStation: string,
    overallLength: number | null,
  ): Promise<AudioItem[]> {
    const files: AudioItem[] = []

    const splitData = this.getSplitInfo(callingPoints, terminatingStation, overallLength)
    const allStops = splitData.stopsUpToSplit.concat(splitData.splitA?.stops ?? []).concat(splitData.splitB?.stops ?? [])

    function shortDataToAudio(shortData: string, stopData: SplitInfoStop['portion']): AudioItem[] {
      const files: AudioItem[] = []

      const [pos, len] = shortData.split('.').map((x, i) => (i === 1 ? parseInt(x) : x)) as [string, number]

      if (stopData.position === 'any' || stopData.position === pos) {
        if (len === 1) {
          files.push(`e.should travel in the ${pos} coach of the train`)
        } else {
          files.push(`m.should travel in the ${pos}`, `platform.s.${len}`, 'e.coaches of the train')
        }
      } else {
        if (len === 1) {
          files.push(`m.should travel in the ${pos}`, 'm.coach')
        } else {
          files.push(`m.should travel in the ${pos}`, `platform.s.${len}`, 'm.coaches')
        }

        if (stopData.length === 1) {
          files.push('m.of', 'm.the', `m.${stopData.position}`, 'e.coach of this train')
        } else {
          files.push('m.of', 'm.the', `m.${stopData.position}`, `platform.s.${stopData.length}`, 'e.coaches of the train')
        }
      }

      return files
    }

    const shortPlatforms = allStops.reduce(
      (acc, curr) => {
        if (!curr.shortPlatform) return acc

        const data = shortDataToAudio(curr.shortPlatform, curr.portion).join(',')

        if (acc[data]) {
          acc[data].push(curr.crsCode)
        } else {
          acc[data] = [curr.crsCode]
        }

        return acc
      },
      {} as Record<string, string[]>,
    )

    const order = Object.keys(shortPlatforms).sort((a, b) => a.localeCompare(b))

    let firstAdded = false

    order.forEach(s => {
      const plats = shortPlatforms[s]

      if (!firstAdded) {
        if (order.length === 1 && plats.length === 1) {
          files.push(
            { id: 'm.due to a short platform at', opts: { delayStart: 400 } },
            `station.m.${plats[0]}`,
            'm.customers for this station',
            ...s.split(','),
          )
        } else {
          files.push(
            { id: 's.due to short platforms customers for', opts: { delayStart: 400 } },
            ...this.pluraliseAudio(plats, {
              prefix: 'station.m.',
              finalPrefix: 'station.m.',
              andId: 'm.and',
              beforeAndDelay: this.CALLING_POINT_AND_DELAY,
              beforeItemDelay: this.CALLING_POINT_DELAY,
              afterAndDelay: this.CALLING_POINT_AND_DELAY,
            }),
            ...s.split(','),
          )
        }
      } else {
        files.push(
          {
            id: 's.customers for',
            opts: { delayStart: 200 },
          },
          ...this.pluraliseAudio(plats, {
            prefix: 'station.m.',
            finalPrefix: 'station.m.',
            andId: 'm.and',
            beforeAndDelay: this.CALLING_POINT_AND_DELAY,
            beforeItemDelay: this.CALLING_POINT_DELAY,
            afterAndDelay: this.CALLING_POINT_AND_DELAY,
          }),
          ...s.split(','),
        )
      }

      firstAdded = true
    })

    return files
  }

  private async getRequestStops(
    callingPoints: CallingAtPoint[],
    terminatingStation: string,
    overallLength: number | null,
  ): Promise<AudioItem[]> {
    const files: AudioItem[] = []

    const splitData = this.getSplitInfo(callingPoints, terminatingStation, overallLength)
    const allStops = splitData.stopsUpToSplit.concat(splitData.splitA?.stops ?? []).concat(splitData.splitB?.stops ?? [])

    const reqStops = new Set(allStops.filter(s => s.requestStop).map(s => s.crsCode))
    if (reqStops.size === 0) return []

    //? KeTech style:
    //
    // files.push(
    //   ...this.pluraliseAudio(Array.from(reqStops), {
    //     prefix: 'station.m.',
    //     finalPrefix: 'station.m.',
    //     andId: 'm.and',
    //     firstItemDelay: 400,
    //     beforeItemDelay: this.CALLING_POINT_DELAY,
    //     beforeAndDelay: this.CALLING_POINT_AND_DELAY,
    //     afterAndDelay: this.CALLING_POINT_AND_DELAY,
    //   }),
    //   reqStops.size === 1 ? 'm.is a request stop and customers for this station' : 'm.are request stops and customers for these stations',
    //   'm.should ask the conductor on the train to arrange for the train to stop',
    //   'e.to allow them to alight',
    // )

    files.push(
      { id: 's.customers may request to stop at', opts: { delayStart: 400 } },
      ...this.pluraliseAudio(Array.from(reqStops), {
        prefix: 'station.m.',
        finalPrefix: 'station.m.',
        andId: 'm.or-2',
        beforeItemDelay: this.CALLING_POINT_DELAY,
        beforeAndDelay: this.CALLING_POINT_AND_DELAY,
        afterAndDelay: this.CALLING_POINT_AND_DELAY,
      }),
      'e.by contacting the conductor on board the train',
    )

    return files
  }

  private getSplitInfo(
    callingPoints: CallingAtPoint[],
    terminatingStation: string,
    overallLength: number | null,
  ): {
    divideType: CallingAtPoint['splitType']
    stopsUpToSplit: SplitInfoStop[]
    splitA: {
      stops: SplitInfoStop[]
      position: 'front' | 'middle' | 'rear' | 'unknown'
      length: number | null
    } | null
    splitB: {
      stops: SplitInfoStop[]
      position: 'front' | 'middle' | 'rear' | 'unknown'
      length: number | null
    } | null
  } {
    // If there are no splits, return an empty array
    if (callingPoints.every(p => p.splitType === 'none' || p.splitType === undefined)) {
      return {
        divideType: 'none',
        stopsUpToSplit: callingPoints.map(p => ({
          crsCode: p.crsCode,
          shortPlatform: p.shortPlatform ?? '',
          requestStop: p.requestStop ?? false,
          portion: { position: 'any', length: overallLength },
        })),
        splitA: null,
        splitB: null,
      }
    }

    const stopsUntilFormationChange: CallingAtPoint[] = []
    let dividePoint: CallingAtPoint | undefined = undefined
    const stopsAfterFormationChange: CallingAtPoint[] = []

    {
      let preSplit = true
      callingPoints.forEach((p, i) => {
        if (preSplit) {
          stopsUntilFormationChange.push(p)
        } else {
          dividePoint ||= callingPoints[i - 1]
          stopsAfterFormationChange.push(p)
        }

        preSplit &&= p.splitType === 'none' || p.splitType === undefined
      })
    }

    stopsAfterFormationChange.push(
      stationItemCompleter({
        crsCode: terminatingStation,
      }),
    )

    if (overallLength === null) {
      return {
        divideType: dividePoint!!.splitType,
        stopsUpToSplit: stopsUntilFormationChange.map(p => ({
          crsCode: p.crsCode,
          shortPlatform: p.shortPlatform ?? '',
          requestStop: p.requestStop ?? false,
          portion: { position: 'any', length: null },
        })),
        splitB: {
          stops: (dividePoint!!.splitCallingPoints ?? []).map(p => ({
            crsCode: p.crsCode,
            shortPlatform: p.shortPlatform ?? '',
            requestStop: p.requestStop ?? false,
            portion: { position: 'unknown', length: null },
          })),
          position: 'unknown',
          length: null,
        },
        splitA: {
          stops: stopsAfterFormationChange.map(p => ({
            crsCode: p.crsCode,
            shortPlatform: p.shortPlatform ?? '',
            requestStop: p.requestStop ?? false,
            portion: { position: aPos, length: aCount },
          })),
          position: 'unknown',
          length: null,
        },
      }
    }

    const [bPos, bCount] = (dividePoint!!.splitForm ?? 'front.1').split('.').map((x, i) => (i === 1 ? parseInt(x) : x)) as [string, number]
    const aPos = bPos === 'front' ? 'rear' : 'front'
    const aCount = Math.min(Math.max(1, overallLength - bCount), 12)

    return {
      divideType: dividePoint!!.splitType,
      stopsUpToSplit: stopsUntilFormationChange.map(p => ({
        crsCode: p.crsCode,
        shortPlatform: p.shortPlatform ?? '',
        requestStop: p.requestStop ?? false,
        portion: { position: 'any', length: overallLength },
      })),
      splitB: {
        stops: (dividePoint!!.splitCallingPoints ?? []).map(p => ({
          crsCode: p.crsCode,
          shortPlatform: p.shortPlatform ?? '',
          requestStop: p.requestStop ?? false,
          portion: { position: bPos as 'front' | 'middle' | 'rear', length: bCount },
        })),
        position: bPos as 'front' | 'middle' | 'rear',
        length: bCount,
      },
      splitA: {
        stops: stopsAfterFormationChange.map(p => ({
          crsCode: p.crsCode,
          shortPlatform: p.shortPlatform ?? '',
          requestStop: p.requestStop ?? false,
          portion: { position: aPos, length: aCount },
        })),
        position: aPos,
        length: aCount,
      },
    }
  }

  private async getCallingPointsWithSplits(
    callingPoints: CallingAtPoint[],
    terminatingStation: string,
    overallLength: number | null,
  ): Promise<AudioItem[]> {
    const files: AudioItem[] = []

    const splitData = this.getSplitInfo(callingPoints, terminatingStation, overallLength)

    if (splitData.divideType === 'none') {
      return []
    }

    const splitPoint = splitData.stopsUpToSplit[splitData.stopsUpToSplit.length - 1]

    files.push(
      ...this.pluraliseAudio(
        splitData.stopsUpToSplit.map(s => `station.m.${s.crsCode}`),
        {
          andId: 'm.and',
          beforeItemDelay: this.CALLING_POINT_DELAY,
          beforeAndDelay: this.CALLING_POINT_AND_DELAY,
          afterAndDelay: this.CALLING_POINT_AND_DELAY,
        },
      ),
    )

    switch (splitData.divideType) {
      case 'splitTerminates':
        files.push('e.where the train will divide', {
          id: 'w.please make sure you travel in the correct part of this train',
          opts: { delayStart: 400 },
        })

        if (splitData.splitB!!.position === 'unknown') {
          files.push({ id: `s.please note that`, opts: { delayStart: 400 } }, `m.coaches`, `m.will be detached and will terminate at`)
        } else {
          files.push(
            { id: `s.please note that the ${splitData.splitB!!.position}`, opts: { delayStart: 400 } },
            `m.${splitData.splitB!!.length === 1 ? 'coach' : `${splitData.splitB!!.length} coaches`} will detach at`,
          )
        }

        files.push(`station.e.${splitPoint.crsCode}`)
        break

      case 'splits':
        files.push('e.where the train will divide', {
          id: 'w.please make sure you travel in the correct part of this train',
          opts: { delayStart: 400 },
        })

        if (!splitData.splitB!!.stops.length) throw new Error("Splitting train doesn't have any calling points")
        break
    }

    const aPortionStops = new Set([...splitData.splitA!!.stops.map(s => s.crsCode)])
    const bPortionStops = new Set([...splitData.splitB!!.stops.map(s => s.crsCode)])
    const anyPortionStops = new Set([
      ...splitData.stopsUpToSplit.map(s => s.crsCode),
      ...Array.from(aPortionStops).filter(x => bPortionStops.has(x)),
    ])

    Array.from(anyPortionStops).forEach(s => {
      if (aPortionStops.has(s)) aPortionStops.delete(s)
      if (bPortionStops.has(s)) bPortionStops.delete(s)
    })

    const listStops = (stops: string[]): AudioItem[] => {
      return [
        { id: 's.customers for', opts: { delayStart: 400 } },
        ...this.pluraliseAudio(
          stops.map(s => `station.m.${s}`),
          {
            andId: 'm.and',
            beforeAndDelay: this.CALLING_POINT_AND_DELAY,
            afterAndDelay: this.CALLING_POINT_AND_DELAY,
            beforeItemDelay: this.CALLING_POINT_DELAY,
          },
        ),
      ]
    }

    if (anyPortionStops.size !== 0) files.push(...listStops(Array.from(anyPortionStops)), 'e.may travel in any part of the train')

    const aFiles =
      aPortionStops.size === 0
        ? []
        : [
            ...listStops(Array.from(aPortionStops)),
            ...(splitData.splitA!!.position === 'unknown'
              ? ['w.please listen for announcements on board the train']
              : [
                  `m.should travel in the ${splitData.splitA!!.position}`,
                  ...(splitData.splitA!!.length === null ? [] : [`platform.s.${splitData.splitA!!.length}`]),
                  'e.coaches of the train',
                ]),
          ]
    const bFiles =
      bPortionStops.size === 0
        ? []
        : [
            ...listStops(Array.from(bPortionStops)),
            ...(splitData.splitB!!.position === 'unknown'
              ? ['w.please listen for announcements on board the train']
              : [
                  `m.should travel in the ${splitData.splitB!!.position}`,
                  ...(splitData.splitB!!.length === null ? [] : [`platform.s.${splitData.splitB!!.length}`]),
                  'e.coaches of the train',
                ]),
          ]

    if (splitData.splitA!!.position === 'front') {
      files.push(...aFiles, ...bFiles)
    } else {
      files.push(...bFiles, ...aFiles)
    }

    switch (splitData.divideType) {
      case 'splitTerminates':
      case 'splits':
        files.push({ id: 's.this train will divide at', opts: { delayStart: 200 } }, `station.e.${splitPoint.crsCode}`)
        break
    }

    return files
  }

  private async getCallingPoints(
    callingPoints: CallingAtPoint[],
    terminatingStation: string,
    overallLength: number | null,
  ): Promise<AudioItem[]> {
    const files: AudioItem[] = []

    const callingPointsWithSplits = await this.getCallingPointsWithSplits(callingPoints, terminatingStation, overallLength)

    if (callingPointsWithSplits.length !== 0) {
      files.push({ id: 'm.calling at', opts: { delayStart: 750 } }, ...callingPointsWithSplits)
      return files
    }

    files.push({ id: 'm.calling at', opts: { delayStart: 750 } })

    if (callingPoints.length === 0) {
      files.push(`station.m.${terminatingStation}`, 'e.only')
    } else {
      files.push(
        ...this.pluraliseAudio([...callingPoints.map(stn => `station.m.${stn.crsCode}`), `station.e.${terminatingStation}`], {
          andId: 'm.and',
          beforeItemDelay: this.CALLING_POINT_DELAY,
          beforeAndDelay: this.CALLING_POINT_AND_DELAY,
          afterAndDelay: this.CALLING_POINT_AND_DELAY,
        }),
      )
    }

    return files
  }

  private async playNextTrainAnnouncement(options: INextTrainAnnouncementOptions, download: boolean = false): Promise<void> {
    const files: AudioItem[] = []

    if (options.chime !== 'none') files.push(`sfx - ${options.chime} chimes`)

    const plat = parseInt(options.platform)

    const platFiles: AudioItem[] = []

    if (plat <= 12 || ['a', 'b'].includes(options.platform.toLowerCase())) {
      platFiles.push({ id: `s.platform ${options.platform} for the`, opts: { delayStart: 250 } })
      if (options.isDelayed) platFiles.push('m.delayed')
    } else {
      platFiles.push(
        { id: `s.platform`, opts: { delayStart: 250 } },
        `platform.s.${options.platform}`,
        options.isDelayed ? `m.for the delayed` : `m.for the`,
      )
    }

    files.push(
      ...platFiles,
      ...(await this.getFilesForBasicTrainInfo(
        options.hour,
        options.min,
        options.toc,
        options.vias.map(s => s.crsCode),
        options.terminatingStationCode,
        options.callingAt,
      )),
    )

    try {
      files.push(
        ...(await this.getCallingPoints(
          options.callingAt,
          options.terminatingStationCode,
          options.coaches ? parseInt(options.coaches.split(' ')[0]) : null,
        )),
      )
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message)
        console.error(e)
        return
      }
    }

    files.push(
      ...(await this.getShortPlatforms(
        options.callingAt,
        options.terminatingStationCode,
        options.coaches ? parseInt(options.coaches.split(' ')[0]) : null,
      )),
    )
    files.push(
      ...(await this.getRequestStops(
        options.callingAt,
        options.terminatingStationCode,
        options.coaches ? parseInt(options.coaches.split(' ')[0]) : null,
      )),
    )

    if (options.coaches) {
      const coaches = options.coaches.split(' ')[0]

      // Platforms share the same audio as coach numbers
      files.push(
        { id: 's.this train is formed of', opts: { delayStart: 250 } },
        `platform.s.${coaches}`,
        `e.${coaches == '1' ? 'coach' : 'coaches'}`,
      )
    }

    files.push(
      ...platFiles,
      ...(await this.getFilesForBasicTrainInfo(
        options.hour,
        options.min,
        options.toc,
        options.vias.map(s => s.crsCode),
        options.terminatingStationCode,
        options.callingAt,
      )),
    )

    await this.playAudioFiles(files, download)
  }

  private async playDisruptedTrainAnnouncement(options: IDisruptedTrainAnnouncementOptions, download: boolean = false): Promise<void> {
    const files: AudioItem[] = []

    if (options.chime !== 'none') files.push(`sfx - ${options.chime} chimes`)

    files.push('s.were sorry to announce that the')
    files.push(
      ...(await this.getFilesForBasicTrainInfo(
        options.hour,
        options.min,
        options.toc,
        options.vias.map(s => s.crsCode),
        options.terminatingStationCode,
        [],
        true,
      )),
    )

    const endInflection = options.disruptionReason ? 'm' : 'e'

    switch (options.disruptionType) {
      case 'delayedBy':
        files.push('m.is delayed by approximately')

        const num = parseInt(options.delayTime)

        if (num < 10) {
          files.push(`platform.m.${num}`)
        } else {
          files.push(`mins.m.${num}`)
        }

        files.push(`${endInflection}.${num !== 1 ? 'minutes' : 'minute'}`)
        break
      case 'delay':
        files.push(`${endInflection}.is being delayed`)
        break
      case 'cancel':
        files.push(`${endInflection}.has been cancelled`)
        break
    }

    if (options.disruptionReason) {
      files.push('m.due to', `disruption-reason.e.${options.disruptionReason}`)
    }

    files.push({ id: 'w.were sorry for the delay this will cause to your journey', opts: { delayStart: 250 } })

    await this.playAudioFiles(files, download)
  }

  readonly platforms = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    .flatMap(x => [`${x}`, `${x}a`, `${x}b`, `${x}c`, `${x}d`])
    .concat(['13', '14', '15', '16', '17', '18', '19', '20', 'a', 'b'])
  readonly stations = [
    'AAP',
    'AAT',
    'ABA',
    'ABC',
    'ABD',
    'ABE',
    'ABH',
    'ABW',
    'ABY',
    'ACB',
    'ACC',
    'ACG',
    'ACH',
    'ACK',
    'ACL',
    'ACN',
    'ACR',
    'ACT',
    'ADC',
    'ADD',
    'ADK',
    'ADL',
    'ADM',
    'ADN',
    'ADR',
    'ADS',
    'ADV',
    'ADW',
    'AFK',
    'AFS',
    'AFV',
    'AGL',
    'AGS',
    'AGT',
    'AGV',
    'AHD',
    'AHN',
    'AHS',
    'AHT',
    'AHV',
    'AIG',
    'AIN',
    'AIR',
    'ALB',
    'ALD',
    'ALF',
    'ALK',
    'ALM',
    'ALN',
    'ALP',
    'ALR',
    'ALT',
    'ALV',
    'ALW',
    'ALX',
    'AMB',
    'AMF',
    'AML',
    'AMR',
    'AMT',
    'AMY',
    'ANC',
    'AND',
    'ANF',
    'ANG',
    'ANL',
    'ANN',
    'ANS',
    'ANZ',
    'AON',
    'APB',
    'APD',
    'APF',
    'APG',
    'APP',
    'APS',
    'ARB',
    'ARD',
    'ARG',
    'ARL',
    'ARM',
    'ARN',
    'ARR',
    'ART',
    'ARU',
    'ASB',
    'ASC',
    'ASG',
    'ASH',
    'ASK',
    'ASN',
    'ASP',
    'ASS',
    'AST',
    'ASY',
    'ATB',
    'ATH',
    'ATL',
    'ATN',
    'ATT',
    'AUD',
    'AUG',
    'AUI',
    'AUK',
    'AUR',
    'AUW',
    'AVF',
    'AVM',
    'AVN',
    'AVY',
    'AWK',
    'AWM',
    'AWT',
    'AXM',
    'AXP',
    'AYH',
    'AYL',
    'AYP',
    'AYR',
    'AYS',
    'AYW',
    'BAA',
    'BAB',
    'BAC',
    'BAD',
    'BAG',
    'BAH',
    'BAI',
    'BAJ',
    'BAK',
    'BAL',
    'BAM',
    'BAN',
    'BAR',
    'BAS',
    'BAT',
    'BAU',
    'BAV',
    'BAW',
    'BAY',
    'BBG',
    'BBK',
    'BBL',
    'BBN',
    'BBS',
    'BBW',
    'BCB',
    'BCC',
    'BCE',
    'BCF',
    'BCG',
    'BCH',
    'BCJ',
    'BCK',
    'BCN',
    'BCS',
    'BCU',
    'BCV',
    'BCY',
    'BDA',
    'BDB',
    'BDC',
    'BDG',
    'BDH',
    'BDI',
    'BDK',
    'BDL',
    'BDM',
    'BDN',
    'BDQ',
    'BDS',
    'BDT',
    'BDW',
    'BDY',
    'BEA',
    'BEB',
    'BEC',
    'BEE',
    'BEF',
    'BEG',
    'BEH',
    'BEL',
    'BEM',
    'BEN',
    'BES',
    'BET',
    'BEU',
    'BEV',
    'BEX',
    'BEY',
    'BFD',
    'BFE',
    'BFF',
    'BFN',
    'BFR',
    'BGA',
    'BGD',
    'BGE',
    'BGG',
    'BGH',
    'BGI',
    'BGL',
    'BGM',
    'BGN',
    'BGS',
    'BHC',
    'BHD',
    'BHG',
    'BHI',
    'BHK',
    'BHM',
    'BHO',
    'BHR',
    'BHS',
    'BIA',
    'BIC',
    'BID',
    'BIF',
    'BIG',
    'BIK',
    'BIL',
    'BIN',
    'BIO',
    'BIP',
    'BIS',
    'BIW',
    'BIY',
    'BKA',
    'BKC',
    'BKD',
    'BKG',
    'BKH',
    'BKJ',
    'BKL',
    'BKM',
    'BKN',
    'BKO',
    'BKP',
    'BKQ',
    'BKS',
    'BKT',
    'BKW',
    'BLA',
    'BLB',
    'BLD',
    'BLE',
    'BLG',
    'BLH',
    'BLK',
    'BLL',
    'BLM',
    'BLN',
    'BLO',
    'BLP',
    'BLT',
    'BLV',
    'BLW',
    'BLX',
    'BLY',
    'BMB',
    'BMC',
    'BMD',
    'BME',
    'BMF',
    'BMG',
    'BMH',
    'BML',
    'BMN',
    'BMO',
    'BMP',
    'BMR',
    'BMS',
    'BMT',
    'BMV',
    'BMY',
    'BNA',
    'BNC',
    'BND',
    'BNE',
    'BNF',
    'BNG',
    'BNH',
    'BNI',
    'BNL',
    'BNM',
    'BNP',
    'BNR',
    'BNS',
    'BNT',
    'BNV',
    'BNW',
    'BNY',
    'BOA',
    'BOC',
    'BOD',
    'BOE',
    'BOG',
    'BOH',
    'BOM',
    'BON',
    'BOP',
    'BOR',
    'BOT',
    'BPB',
    'BPK',
    'BPN',
    'BPS',
    'BPT',
    'BPW',
    'BRA',
    'BRC',
    'BRE',
    'BRF',
    'BRG',
    'BRH',
    'BRI',
    'BRK',
    'BRL',
    'BRM',
    'BRN',
    'BRO',
    'BRP',
    'BRR',
    'BRS',
    'BRT',
    'BRU',
    'BRV',
    'BRW',
    'BRX',
    'BRY',
    'BSB',
    'BSC',
    'BSD',
    'BSE',
    'BSH',
    'BSI',
    'BSJ',
    'BSK',
    'BSL',
    'BSM',
    'BSN',
    'BSO',
    'BSP',
    'BSR',
    'BSS',
    'BSW',
    'BSY',
    'BTB',
    'BTD',
    'BTE',
    'BTF',
    'BTG',
    'BTH',
    'BTL',
    'BTN',
    'BTO',
    'BTR',
    'BTS',
    'BTT',
    'BTY',
    'BUB',
    'BUC',
    'BUD',
    'BUE',
    'BUG',
    'BUH',
    'BUI',
    'BUJ',
    'BUK',
    'BUL',
    'BUO',
    'BUS',
    'BUT',
    'BUU',
    'BUW',
    'BUX',
    'BUY',
    'BVD',
    'BWB',
    'BWD',
    'BWG',
    'BWK',
    'BWN',
    'BWO',
    'BWS',
    'BWT',
    'BXB',
    'BXD',
    'BXH',
    'BXW',
    'BXY',
    'BYA',
    'BYB',
    'BYC',
    'BYD',
    'BYE',
    'BYF',
    'BYI',
    'BYK',
    'BYM',
    'BYN',
    'BYS',
    'CAD',
    'CAG',
    'CAK',
    'CAM',
    'CAN',
    'CAO',
    'CAR',
    'CAT',
    'CAU',
    'CAY',
    'CBB',
    'CBC',
    'CBE',
    'CBG',
    'CBH',
    'CBL',
    'CBN',
    'CBP',
    'CBR',
    'CBS',
    'CBW',
    'CBY',
    'CCC',
    'CCH',
    'CCT',
    'CDB',
    'CDD',
    'CDF',
    'CDI',
    'CDO',
    'CDQ',
    'CDR',
    'CDS',
    'CDT',
    'CDU',
    'CDY',
    'CEA',
    'CED',
    'CEF',
    'CEH',
    'CEL',
    'CES',
    'CET',
    'CEY',
    'CFB',
    'CFC',
    'CFD',
    'CFF',
    'CFH',
    'CFL',
    'CFN',
    'CFO',
    'CFR',
    'CFT',
    'CGD',
    'CGM',
    'CGN',
    'CGW',
    'CHC',
    'CHD',
    'CHE',
    'CHF',
    'CHG',
    'CHH',
    'CHI',
    'CHK',
    'CHL',
    'CHM',
    'CHN',
    'CHO',
    'CHP',
    'CHR',
    'CHT',
    'CHU',
    'CHW',
    'CHX',
    'CHY',
    'CIL',
    'CIM',
    'CIR',
    'CIT',
    'CKH',
    'CKL',
    'CKN',
    'CKS',
    'CKT',
    'CLA',
    'CLC',
    'CLD',
    'CLE',
    'CLG',
    'CLH',
    'CLI',
    'CLJ',
    'CLK',
    'CLL',
    'CLM',
    'CLN',
    'CLP',
    'CLR',
    'CLS',
    'CLU',
    'CLV',
    'CLW',
    'CLY',
    'CMD',
    'CME',
    'CMF',
    'CMH',
    'CML',
    'CMN',
    'CMO',
    'CMR',
    'CMY',
    'CNE',
    'CNF',
    'CNG',
    'CNL',
    'CNM',
    'CNN',
    'CNO',
    'CNP',
    'CNR',
    'CNS',
    'CNW',
    'CNY',
    'COB',
    'COH',
    'COI',
    'COL',
    'COM',
    'CON',
    'COO',
    'COP',
    'COS',
    'COT',
    'COV',
    'COW',
    'COY',
    'CPA',
    'CPH',
    'CPK',
    'CPM',
    'CPT',
    'CPW',
    'CPY',
    'CRA',
    'CRB',
    'CRD',
    'CRE',
    'CRF',
    'CRG',
    'CRH',
    'CRI',
    'CRK',
    'CRL',
    'CRM',
    'CRN',
    'CRO',
    'CRR',
    'CRS',
    'CRT',
    'CRU',
    'CRV',
    'CRW',
    'CRY',
    'CSA',
    'CSB',
    'CSD',
    'CSG',
    'CSH',
    'CSK',
    'CSL',
    'CSM',
    'CSN',
    'CSO',
    'CSR',
    'CSS',
    'CST',
    'CSW',
    'CSY',
    'CTB',
    'CTF',
    'CTH',
    'CTK',
    'CTL',
    'CTM',
    'CTN',
    'CTO',
    'CTR',
    'CTT',
    'CTW',
    'CUA',
    'CUB',
    'CUD',
    'CUF',
    'CUH',
    'CUM',
    'CUP',
    'CUS',
    'CUW',
    'CUX',
    'CWB',
    'CWC',
    'CWE',
    'CWH',
    'CWL',
    'CWM',
    'CWN',
    'CWS',
    'CWU',
    'CWX',
    'CYA',
    'CYB',
    'CYK',
    'CYP',
    'CYS',
    'CYT',
    'DAG',
    'DAK',
    'DAL',
    'DAM',
    'DAN',
    'DAR',
    'DAT',
    'DBC',
    'DBD',
    'DBE',
    'DBG',
    'DBL',
    'DBR',
    'DBY',
    'DCG',
    'DCH',
    'DCT',
    'DCW',
    'DDG',
    'DDK',
    'DDP',
    'DEA',
    'DEE',
    'DEN',
    'DEP',
    'DEW',
    'DFD',
    'DFI',
    'DFR',
    'DGC',
    'DGL',
    'DGS',
    'DGT',
    'DGY',
    'DHM',
    'DHN',
    'DID',
    'DIG',
    'DIN',
    'DIS',
    'DKD',
    'DKG',
    'DKR',
    'DKT',
    'DLG',
    'DLH',
    'DLJ',
    'DLK',
    'DLM',
    'DLR',
    'DLS',
    'DLT',
    'DLW',
    'DLY',
    'DMC',
    'DMF',
    'DMH',
    'DMK',
    'DMP',
    'DMR',
    'DMS',
    'DMY',
    'DND',
    'DNG',
    'DNL',
    'DNM',
    'DNN',
    'DNO',
    'DNS',
    'DNT',
    'DNY',
    'DOC',
    'DOD',
    'DOL',
    'DON',
    'DOR',
    'DOT',
    'DOW',
    'DPD',
    'DPT',
    'DRF',
    'DRG',
    'DRI',
    'DRM',
    'DRN',
    'DRO',
    'DRT',
    'DRU',
    'DSL',
    'DSM',
    'DST',
    'DSY',
    'DTG',
    'DTN',
    'DTW',
    'DUD',
    'DUL',
    'DUM',
    'DUN',
    'DUR',
    'DVC',
    'DVH',
    'DVN',
    'DVP',
    'DVY',
    'DWD',
    'DWL',
    'DWN',
    'DWW',
    'DYC',
    'DYF',
    'DYP',
    'DZY',
    'EAD',
    'EAG',
    'EAL',
    'EAR',
    'EAS',
    'EBA',
    'EBK',
    'EBL',
    'EBN',
    'EBR',
    'EBS',
    'EBT',
    'ECC',
    'ECL',
    'ECR',
    'ECS',
    'ECW',
    'EDB',
    'EDG',
    'EDL',
    'EDN',
    'EDP',
    'EDR',
    'EDW',
    'EDY',
    'EFF',
    'EFL',
    'EGF',
    'EGG',
    'EGH',
    'EGN',
    'EGR',
    'EGT',
    'EIG',
    'EKL',
    'ELD',
    'ELE',
    'ELG',
    'ELO',
    'ELP',
    'ELR',
    'ELS',
    'ELW',
    'ELY',
    'EMD',
    'EML',
    'EMP',
    'EMS',
    'ENC',
    'ENF',
    'ENL',
    'ENT',
    'EPD',
    'EPH',
    'EPS',
    'ERA',
    'ERD',
    'ERH',
    'ERI',
    'ERL',
    'ESD',
    'ESH',
    'ESL',
    'ESM',
    'EST',
    'ESW',
    'ETC',
    'ETL',
    'EUS',
    'EVE',
    'EWD',
    'EWE',
    'EWR',
    'EWW',
    'EXC',
    'EXD',
    'EXM',
    'EXN',
    'EXR',
    'EXT',
    'EYN',
    'Eye',
    'FAL',
    'FAV',
    'FAZ',
    'FBY',
    'FCN',
    'FEA',
    'FEL',
    'FEN',
    'FER',
    'FFA',
    'FFD',
    'FGH',
    'FGT',
    'FIL',
    'FIN',
    'FIT',
    'FKC',
    'FKG',
    'FKH',
    'FKK',
    'FKW',
    'FLD',
    'FLE',
    'FLF',
    'FLI',
    'FLM',
    'FLN',
    'FLS',
    'FLT',
    'FLW',
    'FLX',
    'FML',
    'FMR',
    'FMT',
    'FNB',
    'FNC',
    'FNH',
    'FNN',
    'FNR',
    'FNT',
    'FNV',
    'FNW',
    'FNY',
    'FOC',
    'FOD',
    'FOG',
    'FOH',
    'FOK',
    'FOR',
    'FOX',
    'FPK',
    'FRB',
    'FRD',
    'FRE',
    'FRF',
    'FRL',
    'FRM',
    'FRN',
    'FRO',
    'FRS',
    'FRT',
    'FRW',
    'FRY',
    'FSB',
    'FSG',
    'FSK',
    'FST',
    'FTM',
    'FTN',
    'FTW',
    'FWY',
    'FXN',
    'FYS',
    'FZH',
    'FZP',
    'FZW',
    'GAL',
    'GAR',
    'GBD',
    'GBK',
    'GBL',
    'GBS',
    'GCH',
    'GCR',
    'GCT',
    'GCW',
    'GDH',
    'GDL',
    'GDN',
    'GDP',
    'GEA',
    'GER',
    'GFD',
    'GFF',
    'GFN',
    'GGJ',
    'GGV',
    'GIG',
    'GIL',
    'GIP',
    'GIR',
    'GKC',
    'GKW',
    'GLC',
    'GLD',
    'GLE',
    'GLF',
    'GLG',
    'GLH',
    'GLM',
    'GLO',
    'GLQ',
    'GLS',
    'GLT',
    'GLY',
    'GLZ',
    'GMB',
    'GMD',
    'GMG',
    'GMN',
    'GMT',
    'GMV',
    'GMY',
    'GNB',
    'GNF',
    'GNH',
    'GNL',
    'GNR',
    'GNT',
    'GNW',
    'GOB',
    'GOD',
    'GOE',
    'GOF',
    'GOL',
    'GOM',
    'GOO',
    'GOR',
    'GOS',
    'GOX',
    'GPK',
    'GPO',
    'GRA',
    'GRB',
    'GRC',
    'GRF',
    'GRK',
    'GRL',
    'GRN',
    'GRO',
    'GRP',
    'GRS',
    'GRT',
    'GRV',
    'GRY',
    'GSD',
    'GSL',
    'GSN',
    'GST',
    'GSW',
    'GSY',
    'GTA',
    'GTH',
    'GTN',
    'GTO',
    'GTR',
    'GTW',
    'GTY',
    'GUI',
    'GUN',
    'GVH',
    'GWE',
    'GWN',
    'GYM',
    'GYP',
    'HAB',
    'HAC',
    'HAD',
    'HAG',
    'HAI',
    'HAL',
    'HAM',
    'HAN',
    'HAP',
    'HAS',
    'HAT',
    'HAV',
    'HAY',
    'HAZ',
    'HBB',
    'HBD',
    'HBN',
    'HBP',
    'HBY',
    'HCB',
    'HCH',
    'HCN',
    'HCT',
    'HDB',
    'HDE',
    'HDF',
    'HDG',
    'HDH',
    'HDL',
    'HDM',
    'HDN',
    'HDW',
    'HDY',
    'HEC',
    'HED',
    // 'HEH',
    'HEI',
    'HEL',
    'HEN',
    'HER',
    'HES',
    'HEV',
    'HEW',
    'HEX',
    'HFD',
    'HFE',
    'HFN',
    'HFS',
    'HFX',
    'HGD',
    'HGF',
    'HGG',
    'HGM',
    'HGN',
    'HGR',
    'HGS',
    'HGT',
    'HGY',
    'HHB',
    'HHD',
    'HHE',
    'HHL',
    'HHY',
    'HIA',
    'HIB',
    'HID',
    'HIG',
    'HIL',
    'HIN',
    'HIP',
    'HIR',
    'HIT',
    'HKC',
    'HKH',
    'HKM',
    'HKN',
    'HKW',
    'HLB',
    'HLC',
    'HLD',
    'HLE',
    'HLF',
    'HLG',
    'HLI',
    'HLL',
    'HLM',
    'HLN',
    'HLR',
    'HLS',
    'HLU',
    'HLW',
    'HLY',
    'HMC',
    'HMD',
    'HME',
    'HML',
    'HMM',
    'HMN',
    'HMP',
    'HMS',
    'HMT',
    'HMY',
    'HNA',
    'HNB',
    'HNC',
    'HND',
    'HNF',
    'HNG',
    'HNH',
    'HNK',
    'HNL',
    'HNT',
    'HNW',
    'HNX',
    'HOC',
    'HOD',
    'HOH',
    'HOK',
    'HOL',
    'HON',
    'HOO',
    'HOP',
    'HOR',
    'HOT',
    'HOU',
    'HOV',
    'HOW',
    'HOX',
    'HOY',
    'HOZ',
    'HPA',
    'HPD',
    'HPE',
    'HPL',
    'HPN',
    'HPQ',
    'HPT',
    'HRD',
    'HRH',
    'HRL',
    'HRM',
    'HRN',
    'HRO',
    'HRR',
    'HRS',
    'HRW',
    'HRY',
    'HSB',
    'HSC',
    'HSD',
    'HSG',
    'HSK',
    'HSL',
    'HST',
    'HSW',
    'HSY',
    'HTC',
    'HTE',
    'HTF',
    'HTH',
    'HTN',
    'HTO',
    'HTW',
    'HTY',
    'HUB',
    'HUD',
    'HUL',
    'HUN',
    'HUP',
    'HUR',
    'HUS',
    'HUT',
    'HUY',
    'HVF',
    'HVN',
    'HWB',
    'HWC',
    'HWD',
    'HWH',
    'HWI',
    'HWK',
    'HWM',
    'HWN',
    'HWW',
    'HWY',
    'HXM',
    'HYB',
    'HYC',
    'HYD',
    'HYH',
    'HYK',
    'HYM',
    'HYN',
    'HYR',
    'HYS',
    'HYT',
    'HYW',
    'HYZ',
    'IBM',
    'IFD',
    'IFI',
    'IGD',
    'ILK',
    'INC',
    'INE',
    'ING',
    'INH',
    'INK',
    'INP',
    'INR',
    'INS',
    'INT',
    'INV',
    'IPS',
    'IRL',
    'IRV',
    'ISL',
    'ISP',
    'IVR',
    'IVY',
    'JEQ',
    'JHN',
    'JOH',
    'JOR',
    'KBC',
    'KBF',
    'KBK',
    'KBN',
    'KBW',
    'KBX',
    'KCG',
    'KCK',
    'KDB',
    'KDG',
    'KDY',
    'KEH',
    'KEI',
    'KEL',
    'KEM',
    'KEN',
    'KET',
    'KEY',
    'KGE',
    'KGH',
    'KGL',
    'KGM',
    'KGN',
    'KGP',
    'KGS',
    'KGT',
    'KGX',
    'KID',
    'KIL',
    'KIN',
    'KIR',
    'KIT',
    'KIV',
    'KKB',
    'KKD',
    'KKH',
    'KKM',
    'KKN',
    'KKS',
    'KLD',
    'KLM',
    'KLN',
    'KLY',
    'KMH',
    'KMK',
    'KML',
    'KMP',
    'KMS',
    'KNA',
    'KND',
    'KNE',
    'KNF',
    'KNG',
    'KNI',
    'KNL',
    'KNN',
    'KNO',
    'KNR',
    'KNS',
    'KNT',
    'KNU',
    'KPA',
    'KPT',
    'KRK',
    'KSL',
    'KSN',
    'KSW',
    'KTH',
    'KTL',
    'KTN',
    'KTW',
    'KVP',
    'KWB',
    'KWD',
    'KWG',
    'KWL',
    'KWN',
    'KYL',
    'KYN',
    'LAC',
    'LAD',
    'LAI',
    'LAK',
    'LAM',
    'LAN',
    'LAP',
    'LAR',
    'LAS',
    'LAW',
    'LAY',
    'LBG',
    'LBK',
    'LBO',
    'LBR',
    'LBT',
    'LBZ',
    'LCB',
    'LCC',
    'LCG',
    'LCH',
    'LCK',
    'LCL',
    'LCN',
    'LCS',
    'LDN',
    'LDS',
    'LDY',
    'LEA',
    'LED',
    'LEE',
    'LEH',
    'LEI',
    'LEL',
    'LEM',
    'LEN',
    'LEO',
    'LER',
    'LES',
    'LET',
    'LEU',
    'LEW',
    'LEY',
    'LFD',
    'LGB',
    'LGD',
    'LGE',
    'LGF',
    'LGG',
    'LGJ',
    'LGK',
    'LGM',
    'LGN',
    'LGO',
    'LGS',
    'LGW',
    'LHA',
    'LHD',
    'LHE',
    'LHL',
    'LHM',
    'LHO',
    'LHS',
    'LHW',
    'LIC',
    'LID',
    'LIH',
    'LIN',
    'LIP',
    'LIS',
    'LIT',
    'LIV',
    'LKE',
    'LLA',
    'LLC',
    'LLD',
    'LLE',
    'LLF',
    'LLG',
    'LLH',
    'LLI',
    'LLJ',
    'LLL',
    'LLM',
    'LLN',
    'LLO',
    'LLS',
    'LLT',
    'LLV',
    'LLW',
    'LLY',
    'LMR',
    'LMS',
    'LNB',
    'LND',
    'LNG',
    'LNK',
    'LNR',
    'LNW',
    'LNY',
    'LNZ',
    'LOB',
    'LOC',
    'LOF',
    'LOH',
    'LOO',
    'LOS',
    'LOT',
    'LOW',
    'LPG',
    'LPR',
    'LPT',
    'LPW',
    'LPY',
    'LRB',
    'LRD',
    'LRG',
    'LSK',
    'LSN',
    'LST',
    'LSW',
    'LSY',
    'LTG',
    'LTK',
    'LTL',
    'LTM',
    'LTN',
    'LTP',
    'LTS',
    'LTT',
    'LTV',
    'LUD',
    'LUT',
    'LUX',
    'LVC',
    'LVG',
    'LVJ',
    'LVM',
    'LVN',
    'LVT',
    'LWH',
    'LWR',
    'LWS',
    'LWT',
    'LYC',
    'LYD',
    'LYE',
    'LYM',
    'LYP',
    'LYT',
    'LZB',
    'MAC',
    'MAG',
    'MAI',
    'MAL',
    'MAN',
    'MAO',
    'MAR',
    'MAS',
    'MAT',
    'MAU',
    'MAX',
    'MAY',
    'MBK',
    'MBR',
    'MCB',
    'MCE',
    'MCH',
    'MCM',
    'MCN',
    'MCO',
    'MCV',
    'MDB',
    'MDE',
    'MDG',
    'MDL',
    'MDN',
    'MDS',
    'MDW',
    'MEC',
    'MEL',
    'MEN',
    'MEO',
    'MEP',
    'MER',
    'MES',
    'MEV',
    'MEW',
    'MEX',
    'MFA',
    'MFF',
    'MFH',
    'MFL',
    'MFT',
    'MGM',
    'MGN',
    'MHM',
    'MHR',
    'MHS',
    'MIA',
    'MIC',
    'MIH',
    'MIJ',
    'MIK',
    'MIL',
    'MIM',
    'MIN',
    'MIR',
    'MIS',
    'MKC',
    'MKM',
    'MKR',
    'MKT',
    'MLB',
    'MLD',
    'MLF',
    'MLG',
    'MLH',
    'MLM',
    'MLN',
    'MLR',
    'MLS',
    'MLT',
    'MLW',
    'MLY',
    'MMO',
    'MMT',
    'MNC',
    'MNE',
    'MNG',
    'MNN',
    'MNP',
    'MNR',
    'MOB',
    'MOG',
    'MON',
    'MOO',
    'MOR',
    'MOS',
    'MOT',
    'MPK',
    'MPL',
    'MPT',
    'MRB',
    'MRD',
    'MRF',
    'MRM',
    'MRN',
    'MRP',
    'MRR',
    'MRS',
    'MRT',
    'MRY',
    'MSD',
    'MSH',
    'MSK',
    'MSL',
    'MSN',
    'MSO',
    'MSR',
    'MSS',
    'MST',
    'MSW',
    'MTA',
    'MTB',
    'MTC',
    'MTG',
    'MTH',
    'MTL',
    'MTM',
    'MTN',
    'MTO',
    'MTP',
    'MTS',
    'MTV',
    'MUB',
    'MUF',
    'MUI',
    'MUK',
    'MVL',
    'MYB',
    'MYH',
    'MYL',
    'MYT',
    'MZH',
    'NAN',
    'NAR',
    'NAY',
    'NBA',
    'NBC',
    'NBN',
    'NBR',
    'NBT',
    'NBW',
    'NBY',
    'NCE',
    'NCK',
    'NCL',
    'NCM',
    'NCT',
    'NDL',
    'NEH',
    'NEI',
    'NEL',
    'NEM',
    'NES',
    'NET',
    'NFD',
    'NFL',
    'NFN',
    'NGT',
    'NHD',
    'NHE',
    'NHL',
    'NHY',
    'NIT',
    'NLN',
    'NLR',
    'NLS',
    'NLT',
    'NLW',
    'NMC',
    'NMK',
    'NMN',
    'NMP',
    'NMT',
    'NNG',
    'NNP',
    'NNT',
    'NOA',
    'NOD',
    'NOR',
    'NOT',
    'NPD',
    'NQU',
    'NQY',
    'NRB',
    'NRC',
    'NRD',
    'NRN',
    'NRT',
    'NRW',
    'NSB',
    'NSD',
    'NSG',
    'NSH',
    'NTA',
    'NTB',
    'NTC',
    'NTH',
    'NTL',
    'NTN',
    'NTR',
    'NUF',
    'NUM',
    'NUN',
    'NUT',
    'NVH',
    'NVM',
    'NVN',
    'NVR',
    'NWA',
    'NWB',
    'NWD',
    'NWE',
    'NWI',
    'NWM',
    'NWN',
    'NWP',
    'NWR',
    'NWT',
    'NWX',
    'NXG',
    'OBN',
    'OCK',
    'OHL',
    'OKE',
    'OKL',
    'OKM',
    'OKN',
    'OLD',
    'OLF',
    'OLM',
    'OLT',
    'OLW',
    'OLY',
    'OMS',
    'OPK',
    'ORE',
    'ORN',
    'ORP',
    'ORR',
    'OTF',
    'OUN',
    'OUS',
    'OUT',
    'OVE',
    'OVR',
    'OXF',
    'OXN',
    'OXS',
    'OXT',
    'PAD',
    'PAL',
    'PAN',
    'PAR',
    'PAT',
    'PAW',
    'PBL',
    'PBO',
    'PBR',
    'PBS',
    'PBY',
    'PCD',
    'PCN',
    'PDG',
    'PDW',
    'PEA',
    'PEB',
    'PEG',
    'PEM',
    'PEN',
    'PER',
    'PES',
    'PET',
    'PEV',
    'PEW',
    'PFL',
    'PFM',
    'PFR',
    'PFY',
    'PGM',
    'PGN',
    'PHG',
    'PHR',
    'PIL',
    'PIN',
    'PIT',
    'PKG',
    'PKS',
    'PKT',
    'PLC',
    'PLD',
    'PLE',
    'PLG',
    'PLK',
    'PLM',
    'PLN',
    'PLS',
    'PLT',
    'PLU',
    'PLW',
    'PLY',
    'PMA',
    'PMB',
    'PMD',
    'PMG',
    'PMH',
    'PMP',
    'PMR',
    'PMS',
    'PMT',
    'PMW',
    'PNA',
    'PNC',
    'PNE',
    'PNF',
    'PNL',
    'PNM',
    'PNR',
    'PNS',
    'PNW',
    'PNY',
    'PNZ',
    'POK',
    'POL',
    'PON',
    'POO',
    'POP',
    'POR',
    'POT',
    'PPD',
    'PPK',
    'PPL',
    'PRA',
    'PRB',
    'PRE',
    'PRH',
    'PRL',
    'PRN',
    'PRP',
    'PRR',
    'PRS',
    'PRT',
    'PRU',
    'PRW',
    'PRY',
    'PSC',
    'PSE',
    'PSH',
    'PSL',
    'PSN',
    'PST',
    'PSW',
    'PTA',
    'PTB',
    'PTC',
    'PTD',
    'PTF',
    'PTG',
    'PTH',
    'PTK',
    'PTL',
    'PTM',
    'PTR',
    'PTT',
    'PTW',
    'PUL',
    'PUO',
    'PUR',
    'PUT',
    'PWE',
    'PWL',
    'PWW',
    'PWY',
    'PYC',
    'PYG',
    'PYJ',
    'PYL',
    'PYN',
    'PYP',
    'PYT',
    'QBR',
    'QPK',
    'QPW',
    'QRB',
    'QRP',
    'QUI',
    'QYD',
    'RAD',
    'RAI',
    'RAM',
    'RAN',
    'RAU',
    'RAV',
    'RAY',
    'RBR',
    'RBS',
    'RCC',
    'RCD',
    'RCE',
    'RDA',
    'RDB',
    'RDC',
    'RDD',
    'RDF',
    'RDG',
    'RDH',
    'RDM',
    'RDN',
    'RDR',
    'RDS',
    'RDT',
    'RDW',
    'REC',
    'RED',
    'REE',
    'REI',
    'RET',
    'RFD',
    'RFY',
    'RGL',
    'RGP',
    'RGT',
    'RGW',
    'RHD',
    'RHI',
    'RHL',
    'RHM',
    'RHO',
    'RHY',
    'RIC',
    'RID',
    'RIL',
    'RIS',
    'RKT',
    'RLG',
    'RLN',
    'RMB',
    'RMC',
    'RMD',
    'RMF',
    'RML',
    'RNF',
    'RNH',
    'RNM',
    'RNR',
    'ROB',
    'ROC',
    'ROE',
    'ROG',
    'ROL',
    'ROM',
    'ROO',
    'ROS',
    'ROW',
    'RRB',
    'RSB',
    'RSG',
    'RSH',
    'RTN',
    'RTR',
    'RTY',
    'RUA',
    'RUE',
    'RUF',
    'RUG',
    'RUN',
    'RUS',
    'RUT',
    'RVB',
    'RVN',
    'RWC',
    'RYB',
    'RYD',
    'RYE',
    'RYH',
    'RYN',
    'RYP',
    'RYR',
    'RYS',
    'SAA',
    'SAC',
    'SAD',
    'SAE',
    'SAF',
    'SAH',
    'SAJ',
    'SAL',
    'SAM',
    'SAN',
    'SAR',
    'SAS',
    'SAT',
    'SAU',
    'SAV',
    'SAW',
    'SAX',
    'SAY',
    'SBE',
    'SBF',
    'SBJ',
    'SBK',
    'SBM',
    'SBP',
    'SBR',
    'SBS',
    'SBT',
    'SBU',
    'SBV',
    'SBY',
    'SCA',
    'SCB',
    'SCF',
    'SCG',
    'SCH',
    'SCR',
    'SCS',
    'SCT',
    'SCU',
    'SCY',
    'SDA',
    'SDB',
    'SDE',
    'SDF',
    'SDG',
    'SDH',
    'SDL',
    'SDM',
    'SDN',
    'SDP',
    'SDR',
    'SDW',
    'SDY',
    'SEA',
    'SEB',
    'SEC',
    'SED',
    'SEE',
    'SEF',
    'SEG',
    'SEH',
    'SEL',
    'SEM',
    'SEN',
    'SER',
    'SES',
    'SET',
    'SEV',
    'SFA',
    'SFD',
    'SFL',
    'SFN',
    'SFO',
    'SFR',
    'SGB',
    'SGE',
    'SGL',
    'SGM',
    'SGN',
    'SGR',
    'SHA',
    'SHC',
    'SHD',
    'SHE',
    'SHF',
    'SHH',
    'SHI',
    'SHJ',
    'SHL',
    'SHM',
    'SHN',
    'SHO',
    'SHP',
    'SHR',
    'SHS',
    'SHT',
    'SHU',
    'SHW',
    'SHY',
    'SIA',
    'SIC',
    'SID',
    'SIE',
    'SIH',
    'SIL',
    'SIN',
    'SIP',
    'SIT',
    'SIV',
    'SJP',
    'SJS',
    'SKE',
    'SKG',
    'SKI',
    'SKK',
    'SKM',
    'SKN',
    'SKS',
    'SKW',
    'SLA',
    'SLB',
    'SLD',
    'SLH',
    'SLK',
    'SLL',
    'SLO',
    'SLQ',
    'SLR',
    'SLS',
    'SLT',
    'SLV',
    'SLW',
    'SLY',
    'SMA',
    'SMB',
    'SMD',
    'SMG',
    'SMH',
    'SMK',
    'SML',
    'SMN',
    'SMO',
    'SMR',
    'SMT',
    'SMY',
    'SNA',
    'SND',
    'SNE',
    'SNF',
    'SNG',
    'SNH',
    'SNI',
    'SNK',
    'SNL',
    'SNN',
    'SNO',
    'SNR',
    'SNS',
    'SNT',
    'SNW',
    'SNY',
    'SOA',
    'SOB',
    'SOC',
    'SOE',
    'SOG',
    'SOH',
    'SOK',
    'SOL',
    'SOM',
    'SON',
    'SOO',
    'SOP',
    'SOR',
    'SOT',
    'SOU',
    'SOV',
    'SOW',
    'SPA',
    'SPB',
    'SPF',
    'SPH',
    'SPI',
    'SPK',
    'SPN',
    'SPO',
    'SPP',
    'SPR',
    'SPS',
    'SPT',
    'SPU',
    'SPY',
    'SQE',
    'SQH',
    'SQU',
    'SRA',
    'SRC',
    'SRD',
    'SRF',
    'SRG',
    'SRH',
    'SRI',
    'SRL',
    'SRN',
    'SRO',
    'SRR',
    'SRS',
    'SRT',
    'SRU',
    'SRY',
    'SSC',
    'SSD',
    'SSE',
    'SSM',
    'SSS',
    'SST',
    'STA',
    'STC',
    'STD',
    'STE',
    'STF',
    'STG',
    'STH',
    'STJ',
    'STK',
    'STL',
    'STM',
    'STN',
    'STO',
    'STP',
    'STR',
    'STS',
    'STT',
    'STU',
    'STV',
    'STW',
    'SUC',
    'SUD',
    'SUG',
    'SUM',
    'SUN',
    'SUO',
    'SUP',
    'SUR',
    'SUT',
    'SUU',
    'SUY',
    'SVB',
    'SVG',
    'SVK',
    'SVL',
    'SVR',
    'SVS',
    'SWA',
    'SWD',
    'SWE',
    'SWG',
    'SWI',
    'SWK',
    'SWL',
    'SWM',
    'SWN',
    'SWO',
    'SWP',
    'SWR',
    'SWS',
    'SWT',
    'SWY',
    'SXY',
    'SYA',
    'SYB',
    'SYD',
    'SYH',
    'SYL',
    'SYS',
    'SYT',
    'TAB',
    'TAC',
    'TAD',
    'TAF',
    'TAI',
    'TAL',
    'TAM',
    'TAP',
    'TAT',
    'TAU',
    'TAY',
    'TBD',
    'TBR',
    'TBT',
    'TBW',
    'TBY',
    'TDU',
    'TEA',
    'TED',
    'TEE',
    'TEN',
    'TEO',
    'TEY',
    'TFC',
    'TGM',
    'TGS',
    'THA',
    'THB',
    'THC',
    'THD',
    'THE',
    'THH',
    'THI',
    'THL',
    'THO',
    'THS',
    'THT',
    'THU',
    'THW',
    'TIL',
    'TIP',
    'TIR',
    'TIS',
    'TLB',
    'TLC',
    'TLH',
    'TLK',
    'TLS',
    'TMC',
    'TNA',
    'TNF',
    'TNN',
    'TNP',
    'TNS',
    'TOB',
    'TOD',
    'TOK',
    'TOL',
    'TOM',
    'TON',
    'TOO',
    'TOP',
    'TOT',
    'TPB',
    'TPC',
    'TPN',
    'TQY',
    'TRA',
    'TRB',
    'TRD',
    'TRE',
    'TRF',
    'TRH',
    'TRI',
    'TRM',
    'TRN',
    'TRO',
    'TRR',
    'TRS',
    'TRU',
    'TRY',
    'TTF',
    'TTH',
    'TTN',
    'TUH',
    'TUL',
    'TUR',
    'TUT',
    'TVP',
    'TWI',
    'TWN',
    'TWY',
    'TYC',
    'TYG',
    'TYL',
    'TYS',
    'TYW',
    'UCK',
    'UDD',
    'UHA',
    'UHL',
    'ULC',
    'ULL',
    'ULP',
    'ULV',
    'UMB',
    'UNI',
    'UPH',
    'UPL',
    'UPM',
    'UPT',
    'UPW',
    'URM',
    'UTT',
    'UTY',
    'UWL',
    'VAL',
    'VIC',
    'VIR',
    'VXH',
    'WAC',
    'WAD',
    'WAE',
    'WAF',
    'WAL',
    'WAM',
    'WAN',
    'WAO',
    'WAR',
    'WAS',
    'WAT',
    'WBC',
    'WBD',
    'WBL',
    'WBO',
    'WBP',
    'WBQ',
    'WBR',
    'WBY',
    'WCB',
    'WCH',
    'WCK',
    'WCL',
    'WCM',
    'WCP',
    'WCR',
    'WCX',
    'WCY',
    'WDB',
    'WDD',
    'WDE',
    'WDH',
    'WDL',
    'WDM',
    'WDN',
    'WDO',
    'WDS',
    'WDT',
    'WDU',
    'WEA',
    'WED',
    'WEE',
    'WEL',
    'WEM',
    'WET',
    'WEY',
    'WFF',
    'WFH',
    'WFI',
    'WFJ',
    'WFL',
    'WFN',
    'WGA',
    'WGC',
    'WGN',
    'WGR',
    'WGT',
    'WGV',
    'WGW',
    'WHA',
    'WHC',
    'WHD',
    'WHE',
    'WHG',
    'WHI',
    'WHL',
    'WHM',
    'WHN',
    'WHP',
    'WHR',
    'WHS',
    'WHT',
    'WHY',
    'WIC',
    'WID',
    'WIH',
    'WIJ',
    'WIL',
    'WIM',
    'WIN',
    'WIV',
    'WKB',
    'WKD',
    'WKF',
    'WKG',
    'WKI',
    'WKK',
    'WKM',
    'WLC',
    'WLD',
    'WLE',
    'WLF',
    'WLG',
    'WLI',
    'WLM',
    'WLN',
    'WLP',
    'WLS',
    'WLT',
    'WLV',
    'WLW',
    'WLY',
    'WMA',
    'WMB',
    'WMC',
    'WMD',
    'WME',
    'WMG',
    'WMI',
    'WML',
    'WMN',
    'WMR',
    'WMS',
    'WMW',
    'WNC',
    'WND',
    'WNE',
    'WNF',
    'WNG',
    'WNH',
    'WNL',
    'WNM',
    'WNN',
    'WNP',
    'WNR',
    'WNS',
    'WNT',
    'WNW',
    'WNY',
    'WOB',
    'WOF',
    'WOH',
    'WOK',
    'WOL',
    'WOM',
    'WON',
    'WOO',
    'WOP',
    'WOR',
    'WOS',
    'WPE',
    'WPL',
    'WRB',
    'WRE',
    'WRH',
    'WRK',
    'WRL',
    'WRM',
    'WRN',
    'WRP',
    'WRS',
    'WRT',
    'WRU',
    'WRW',
    'WRX',
    'WRY',
    'WSA',
    'WSB',
    'WSE',
    'WSF',
    'WSH',
    'WSL',
    'WSM',
    'WSR',
    'WST',
    'WSU',
    'WSW',
    'WTA',
    'WTB',
    'WTC',
    'WTE',
    'WTG',
    'WTH',
    'WTI',
    'WTL',
    'WTM',
    'WTN',
    'WTO',
    'WTR',
    'WTS',
    'WTW',
    'WTY',
    'WVF',
    'WVH',
    'WWA',
    'WWC',
    'WWD',
    'WWI',
    'WWO',
    'WWR',
    'WWW',
    'WXC',
    'WYB',
    'WYE',
    'WYL',
    'WYM',
    'WYQ',
    'WYT',
    'XFG',
    'YAE',
    'YAL',
    'YAT',
    'YEO',
    'YET',
    'YMH',
    'YNW',
    'YOK',
    'YRD',
    'YRK',
    'YRM',
    'YRT',
    'YSM',
    'YSR',
    'YVJ',
    'YVP',
    'ZBB',
    'ZCW',
    'ZFD',
    'ZLW',
  ]
  private shortPlatforms = [
    { value: 'front.1', title: 'Front coach' },
    { value: 'front.2', title: 'Front 2 coaches' },
    { value: 'front.3', title: 'Front 3 coaches' },
    { value: 'front.4', title: 'Front 4 coaches' },
    { value: 'front.5', title: 'Front 5 coaches' },
    { value: 'front.6', title: 'Front 6 coaches' },
    { value: 'front.7', title: 'Front 7 coaches' },
    { value: 'front.8', title: 'Front 8 coaches' },
    { value: 'front.9', title: 'Front 9 coaches' },
    { value: 'front.10', title: 'Front 10 coaches' },
    { value: 'front.11', title: 'Front 11 coaches' },
    { value: 'front.12', title: 'Front 12 coaches' },
    { value: 'middle.1', title: 'Middle coach' },
    { value: 'middle.2', title: 'Middle 2 coaches' },
    { value: 'middle.3', title: 'Middle 3 coaches' },
    { value: 'middle.4', title: 'Middle 4 coaches' },
    { value: 'middle.5', title: 'Middle 5 coaches' },
    { value: 'middle.6', title: 'Middle 6 coaches' },
    { value: 'middle.7', title: 'Middle 7 coaches' },
    { value: 'middle.8', title: 'Middle 8 coaches' },
    { value: 'middle.9', title: 'Middle 9 coaches' },
    { value: 'middle.10', title: 'Middle 10 coaches' },
    { value: 'middle.11', title: 'Middle 11 coaches' },
    { value: 'middle.12', title: 'Middle 12 coaches' },
    { value: 'rear.1', title: 'Rear coach' },
    { value: 'rear.2', title: 'Rear 2 coaches' },
    { value: 'rear.3', title: 'Rear 3 coaches' },
    { value: 'rear.4', title: 'Rear 4 coaches' },
    { value: 'rear.5', title: 'Rear 5 coaches' },
    { value: 'rear.6', title: 'Rear 6 coaches' },
    { value: 'rear.7', title: 'Rear 7 coaches' },
    { value: 'rear.8', title: 'Rear 8 coaches' },
    { value: 'rear.9', title: 'Rear 9 coaches' },
    { value: 'rear.10', title: 'Rear 10 coaches' },
    { value: 'rear.11', title: 'Rear 11 coaches' },
    { value: 'rear.12', title: 'Rear 12 coaches' },
  ]
  private splits = [
    { value: 'front.1', title: 'Front coach' },
    { value: 'front.2', title: 'Front 2 coaches' },
    { value: 'front.3', title: 'Front 3 coaches' },
    { value: 'front.4', title: 'Front 4 coaches' },
    { value: 'front.5', title: 'Front 5 coaches' },
    { value: 'front.6', title: 'Front 6 coaches' },
    { value: 'front.7', title: 'Front 7 coaches' },
    { value: 'front.8', title: 'Front 8 coaches' },
    { value: 'front.9', title: 'Front 9 coaches' },
    { value: 'front.10', title: 'Front 10 coaches' },
    { value: 'front.11', title: 'Front 11 coaches' },
    { value: 'front.12', title: 'Front 12 coaches' },
    // { value: 'middle.1', title: 'Middle coach' },
    // { value: 'middle.2', title: 'Middle 2 coaches' },
    // { value: 'middle.3', title: 'Middle 3 coaches' },
    // { value: 'middle.4', title: 'Middle 4 coaches' },
    // { value: 'middle.5', title: 'Middle 5 coaches' },
    // { value: 'middle.6', title: 'Middle 6 coaches' },
    // { value: 'middle.7', title: 'Middle 7 coaches' },
    // { value: 'middle.8', title: 'Middle 8 coaches' },
    // { value: 'middle.9', title: 'Middle 9 coaches' },
    // { value: 'middle.10', title: 'Middle 10 coaches' },
    // { value: 'middle.11', title: 'Middle 11 coaches' },
    // { value: 'middle.12', title: 'Middle 12 coaches' },
    { value: 'rear.1', title: 'Rear coach' },
    { value: 'rear.2', title: 'Rear 2 coaches' },
    { value: 'rear.3', title: 'Rear 3 coaches' },
    { value: 'rear.4', title: 'Rear 4 coaches' },
    { value: 'rear.5', title: 'Rear 5 coaches' },
    { value: 'rear.6', title: 'Rear 6 coaches' },
    { value: 'rear.7', title: 'Rear 7 coaches' },
    { value: 'rear.8', title: 'Rear 8 coaches' },
    { value: 'rear.9', title: 'Rear 9 coaches' },
    { value: 'rear.10', title: 'Rear 10 coaches' },
    { value: 'rear.11', title: 'Rear 11 coaches' },
    { value: 'rear.12', title: 'Rear 12 coaches' },
  ]

  readonly customAnnouncementTabs: Record<string, CustomAnnouncementTab> = {
    nextTrain: {
      name: 'Next train',
      component: CustomAnnouncementPane,
      props: {
        presets: this.announcementPresets.nextTrain,
        playHandler: this.playNextTrainAnnouncement.bind(this),
        options: {
          chime: {
            name: 'Chime',
            type: 'select',
            default: 'four',
            options: [
              { title: '3 chimes', value: 'three' },
              { title: '4 chimes', value: 'four' },
              { title: 'No chime', value: 'none' },
            ],
          },
          platform: {
            name: 'Platform',
            default: this.platforms[0],
            options: this.platforms.map(p => ({ title: `Platform ${p.toUpperCase()}`, value: p })),
            type: 'select',
          },
          hour: {
            name: 'Hour',
            default: '07',
            options: [
              '00 - midnight',
              '01',
              '02',
              '03',
              '04',
              '05',
              '06',
              '07',
              '08',
              '09',
              '10',
              '11',
              '12',
              '13',
              '14',
              '15',
              '16',
              '17',
              '18',
              '19',
              '20',
              '21',
              '22',
              '23',
            ].map(h => ({ title: h, value: h })),
            type: 'select',
          },
          min: {
            name: 'Minute',
            default: '33',
            options: ['00 - hundred', '00 - hundred-hours']
              .concat(new Array(58).fill(0).map((_, i) => (i + 2).toString()))
              .map(m => ({ title: m.toString().padStart(2, '0'), value: m.toString().padStart(2, '0') })),
            type: 'select',
          },
          isDelayed: {
            name: 'Delayed?',
            default: false,
            type: 'boolean',
          },
          toc: {
            name: 'TOC',
            default: '',
            options: [{ title: 'None', value: '' }].concat(this.ALL_AVAILABLE_TOCS.map(m => ({ title: m, value: m.toLowerCase() }))),
            type: 'select',
          },
          terminatingStationCode: {
            name: 'Terminating station',
            default: this.stations[0],
            options: this.stations.map(s => {
              const stn = getStationByCrs(s)
              return { title: stn ? `${stn.stationName} (${s})` : `Unknown name (${s})`, value: s }
            }),
            type: 'select',
          },
          vias: {
            name: '',
            type: 'custom',
            component: CallingAtSelector,
            props: {
              availableStations: this.stations,
              selectLabel: 'Via points (non-splitting services only)',
              placeholder: 'Add a via point...',
              heading: 'Via... (optional)',
            },
            default: [],
          },
          callingAt: {
            name: '',
            type: 'custom',
            component: CallingAtSelector,
            props: {
              availableStations: this.stations,
              enableShortPlatforms: this.shortPlatforms,
              enableRequestStops: true,
              enableSplits: this.splits,
            },
            default: [],
          },
          coaches: {
            name: 'Coach count',
            default: '8 coaches',
            options: [
              '1 coach',
              '2 coaches',
              '3 coaches',
              '4 coaches',
              '5 coaches',
              '6 coaches',
              '7 coaches',
              '8 coaches',
              '9 coaches',
              '10 coaches',
              '11 coaches',
              '12 coaches',
            ].map(c => ({ title: c, value: c })),
            type: 'select',
          },
        },
      },
    },
    disruptedTrain: {
      name: 'Disrupted train',
      component: CustomAnnouncementPane,
      props: {
        // presets: this.announcementPresets.nextTrain,
        playHandler: this.playDisruptedTrainAnnouncement.bind(this),
        options: {
          chime: {
            name: 'Chime',
            type: 'select',
            default: 'four',
            options: [
              { title: '3 chimes', value: 'three' },
              { title: '4 chimes', value: 'four' },
              { title: 'No chime', value: 'none' },
            ],
          },
          hour: {
            name: 'Hour',
            default: '07',
            options: [
              '00 - midnight',
              '01',
              '02',
              '03',
              '04',
              '05',
              '06',
              '07',
              '08',
              '09',
              '10',
              '11',
              '12',
              '13',
              '14',
              '15',
              '16',
              '17',
              '18',
              '19',
              '20',
              '21',
              '22',
              '23',
            ].map(h => ({ title: h, value: h })),
            type: 'select',
          },
          min: {
            name: 'Minute',
            default: '33',
            options: ['00 - hundred', '00 - hundred-hours']
              .concat(new Array(58).fill(0).map((_, i) => (i + 2).toString()))
              .map(m => ({ title: m.toString().padStart(2, '0'), value: m.toString().padStart(2, '0') })),
            type: 'select',
          },
          toc: {
            name: 'TOC',
            default: '',
            options: [{ title: 'None', value: '' }].concat(this.ALL_AVAILABLE_TOCS.map(m => ({ title: m, value: m.toLowerCase() }))),
            type: 'select',
          },
          terminatingStationCode: {
            name: 'Terminating station',
            default: this.stations[0],
            options: this.stations.map(s => {
              const stn = getStationByCrs(s)
              return { title: stn ? `${stn.stationName} (${s})` : `Unknown name (${s})`, value: s }
            }),
            type: 'select',
          },
          vias: {
            name: '',
            type: 'custom',
            component: CallingAtSelector,
            props: {
              availableStations: this.stations,
              selectLabel: 'Via points (non-splitting services only)',
              placeholder: 'Add a via point...',
              heading: 'Via... (optional)',
            },
            default: [],
          },
          disruptionType: {
            name: 'Disruption type',
            type: 'select',
            options: [
              { value: 'delayedBy', title: 'Delayed by...' },
              { value: 'delay', title: 'Delayed' },
              { value: 'cancel', title: 'Cancelled' },
            ],
            default: 'delayedBy',
          },
          delayTime: {
            name: 'Delay length',
            type: 'select',
            options: new Array(60).fill(0).map((_, i) => ({ value: (i + 1).toString(), title: `${i + 1} minute${i === 0 ? '' : 's'}` })),
            default: '10',
            onlyShowWhen(activeState) {
              return activeState.disruptionType === 'delayedBy'
            },
          },
          disruptionReason: {
            name: 'Disruption reason',
            type: 'select',
            options: [{ value: '', title: 'None' }, ...this.DISRUPTION_REASONS.map(r => ({ value: r, title: r }))],
            default: '',
          },
        },
      },
    },
    liveTrains: {
      name: 'Live trains (beta)',
      component: LiveTrainAnnouncements,
      props: {
        nextTrainHandler: this.playNextTrainAnnouncement.bind(this),
        system: this,
      },
    },
    announcementButtons: {
      name: 'Announcement buttons',
      component: CustomButtonPane,
      props: {
        buttonSections: {
          General: [
            {
              label: '3 chimes',
              play: this.playAudioFiles.bind(this, ['sfx - three chimes']),
              download: this.playAudioFiles.bind(this, ['sfx - three chimes'], true),
            },
            {
              label: '4 chimes',
              play: this.playAudioFiles.bind(this, ['sfx - four chimes']),
              download: this.playAudioFiles.bind(this, ['sfx - four chimes'], true),
            },
          ],
          Emergency: [
            {
              label: 'Newton Aycliffe chemical emergency',
              play: this.playAudioFiles.bind(this, [
                's.this is an emergency announcement',
                'e.for customers at newton aycliffe station',
                { id: 's.there is an emergency at a nearby chemical works', opts: { delayStart: 300 } },
                { id: 'm.please leave the station by the ramp from platform 1', opts: { delayStart: 300 } },
                'e.and turning left make your way to a position of safety',
                { id: 'e.listen for announcement by the emergency services', opts: { delayStart: 300 } },
              ]),
              download: this.playAudioFiles.bind(
                this,
                [
                  's.this is an emergency announcement',
                  'e.for customers at newton aycliffe station',
                  { id: 's.there is an emergency at a nearby chemical works', opts: { delayStart: 300 } },
                  { id: 'm.please leave the station by the ramp from platform 1', opts: { delayStart: 300 } },
                  'e.and turning left make your way to a position of safety',
                  { id: 'e.listen for announcement by the emergency services', opts: { delayStart: 300 } },
                ],
                true,
              ),
            },
            {
              label: 'Castleford chemical emergency',
              play: this.playAudioFiles.bind(this, [
                's.this is an emergency announcement',
                'e.for customers at castleford station',
                { id: 's.there is an emergency at a nearby chemical works', opts: { delayStart: 300 } },
                { id: 'm.please leave the station by the main exit', opts: { delayStart: 300 } },
                'e.and proceed to the town centre',
                { id: 'e.listen for announcement by the emergency services', opts: { delayStart: 300 } },
              ]),
              download: this.playAudioFiles.bind(
                this,
                [
                  's.this is an emergency announcement',
                  'e.for customers at castleford station',
                  { id: 's.there is an emergency at a nearby chemical works', opts: { delayStart: 300 } },
                  { id: 'm.please leave the station by the main exit', opts: { delayStart: 300 } },
                  'e.and proceed to the town centre',
                  { id: 'e.listen for announcement by the emergency services', opts: { delayStart: 300 } },
                ],
                true,
              ),
            },
          ],
        },
      },
    },
  }
}

interface LiveTrainAnnouncementsProps extends ICustomAnnouncementPaneProps {
  system: AmeyPhil
  nextTrainHandler: (options: INextTrainAnnouncementOptions) => Promise<void>
}

import FullScreen from 'react-fullscreen-crossbrowser'
import { Option } from '@helpers/createOptionField'
import Select from 'react-select'
import { makeStyles } from '@material-ui/styles'

const useLiveTrainsStyles = makeStyles({
  fullscreenButton: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 16,
  },
  iframe: {
    border: 'none',
    width: '100%',
    height: 400,

    ':fullscreen &': {
      height: '100%',
    },
  },
})

const MIN_TIME_TO_ANNOUNCE = 4

function LiveTrainAnnouncements({ nextTrainHandler, system }: LiveTrainAnnouncementsProps) {
  const classes = useLiveTrainsStyles()

  const supportedStations: Option[] = useMemo(
    () =>
      system.stations.map(s => {
        const r = crsToStationItemMapper(s)

        return {
          value: r.crsCode,
          label: r.name,
        }
      }),
    [system.stations],
  )

  const [isFullscreen, setFullscreen] = useState(false)
  const [selectedCrs, setselectedCrs] = useState('ECR')
  const [hasEnabledFeature, setHasEnabledFeature] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const nextTrainAnnounced = useRef<Record<string, number>>({})

  const stationNameToCrsMap = useMemo(
    () =>
      Object.fromEntries(
        supportedStations.map(s => {
          if (!s.label) {
            console.warn(`[Live Trains] Station ${s.value} has no label!`)
            return [s.value, s.value]
          }

          return [s.label.toLowerCase(), s.value]
        }),
      ),
    [supportedStations],
  )

  const removeOldIds = useCallback(
    function removeOldIds() {
      const now = Date.now()
      const newIds = Object.fromEntries(Object.entries(nextTrainAnnounced.current).filter(([_, v]) => now - v < 1000 * 60 * 60))
      nextTrainAnnounced.current = newIds
    },
    [nextTrainAnnounced.current],
  )

  const markTrainIdAnnounced = useCallback(
    function markTrainIdAnnounced(id: string) {
      nextTrainAnnounced.current[id] = Date.now()
    },
    [nextTrainAnnounced.current],
  )

  useEffect(() => {
    const key = setInterval(removeOldIds, 1000 * 60 * 5)

    return () => {
      clearInterval(key)
    }
  }, [removeOldIds])

  const calculateDelayMins = useCallback(
    function calculateDelayMins(std: string, etd: string): number {
      const isDelayed = etd !== 'On time' && etd !== std
      if (!isDelayed) return 0

      const hasRealEta = (etd as string).includes(':')

      if (!hasRealEta) return 0

      const sTime = std.split(':')
      const eTime = etd.split(':')

      const [h, m] = sTime.map(x => parseInt(x))
      const [eH, eM] = eTime.map(x => parseInt(x))

      console.log(`[Delay Mins] ${h}:${m} (${std}) -> ${eH}:${eM} (${etd}) = ${eH * 60 + eM - (h * 60 + m)}`)

      let delayMins = Math.abs(eH * 60 + eM - (h * 60 + m))

      if (delayMins < 0) {
        // crosses over midnight
        return calculateDelayMins(std, '23:59') + calculateDelayMins('00:00', etd)
      }

      return delayMins
    },
    [console.log],
  )

  const calculateArrivalInMins = useCallback(
    function calculateArrivalInMins(etd: string): number {
      // HH:mm in UK
      const std = new Date().toLocaleTimeString('en-GB', { hour12: false, timeZone: 'Europe/London' }).slice(0, 5)

      const isDelayed = etd !== 'On time' && etd !== std
      if (!isDelayed) return 0

      const hasRealEta = (etd as string).includes(':')

      if (!hasRealEta) return 0

      const sTime = std.split(':')
      const eTime = etd.split(':')

      const [h, m] = sTime.map(x => parseInt(x))
      const [eH, eM] = eTime.map(x => parseInt(x))

      console.log(`[ETA mins] ${h}:${m} (${std}) -> ${eH}:${eM} (${etd}) = ${eH * 60 + eM - (h * 60 + m)}`)

      let delayMins = Math.abs(eH * 60 + eM - (h * 60 + m))

      if (delayMins < 0) {
        // crosses over midnight
        return calculateDelayMins(std, '23:59') + calculateDelayMins('00:00', etd)
      }

      return delayMins
    },
    [calculateDelayMins, console.log],
  )

  const processToc = useCallback(function processToc(toc: string, originCrs: string, destinationCrs: string): string {
    switch (toc.toLowerCase()) {
      default:
        return system.ALL_AVAILABLE_TOCS.find(t => t?.toLowerCase() === toc?.toLowerCase()) ?? ''

      case 'west midlands trains':
        // https://www.westmidlandsrailway.co.uk/media/3657/download?inline
        const lnwr = ['EUS', 'CRE', 'BDM', 'SAA', 'MKC', 'TRI', 'LIV', 'NMP']
        if (lnwr.includes(originCrs) || lnwr.includes(destinationCrs)) {
          return 'london north western railway'
        } else {
          return 'west midlands railway'
        }
    }
  }, [])

  useEffect(() => {
    if (!hasEnabledFeature) return

    const abortController = new AbortController()

    const checkAndPlay = async () => {
      if (isPlaying) {
        console.log('[Live Trains] Still playing an announcement; skipping this check')
        return
      }

      console.log('[Live Trains] Checking for new services')

      let services

      try {
        const resp = await fetch(
          `https://national-rail-api.davwheat.dev/departures/${selectedCrs}?expand=true&numServices=15&timeOffset=0&timeWindow=${MIN_TIME_TO_ANNOUNCE}`,
        )

        if (!resp.ok) {
          console.warn("[Live Trains] Couldn't fetch data from API")
          return
        }

        try {
          const data = await resp.json()
          services = data.trainServices
        } catch {
          console.warn("[Live Trains] Couldn't parse JSON from API")
          return
        }
      } catch (e) {
        console.warn('[Live Trains] Failed to fetch')
        return
      }

      if (!services) {
        console.log('[Live Trains] No services in API response')
        return
      }

      console.log(`[Live Trains] ${services.length} services found`)

      const firstUnannounced = services.find(s => {
        if (nextTrainAnnounced.current[s.serviceIdGuid]) {
          console.log(`[Live Trains] Skipping ${s.serviceIdGuid} (${s.std} to ${s.destination[0].locationName}) as it was announced recently`)
          return false
        }
        if (s.isCancelled) {
          console.log(`[Live Trains] Skipping ${s.serviceIdGuid} (${s.std} to ${s.destination[0].locationName}) as it is cancelled`)
          return false
        }
        if (s.etd === 'Delayed') {
          console.log(`[Live Trains] Skipping ${s.serviceIdGuid} (${s.std} to ${s.destination[0].locationName}) as it has no estimated time`)
          return false
        }
        if (s.platform === null) {
          console.log(`[Live Trains] Skipping ${s.serviceIdGuid} (${s.std} to ${s.destination[0].locationName}) as it has no confirmed platform`)
          return false
        }
        if (calculateArrivalInMins(s.etd) > MIN_TIME_TO_ANNOUNCE) {
          console.log(
            `[Live Trains] Skipping ${s.serviceIdGuid} (${s.std} to ${s.destination[0].locationName}) as it is more than ${MIN_TIME_TO_ANNOUNCE} mins away`,
          )
          return false
        }

        return true
      })

      if (!firstUnannounced) {
        console.log('[Live Trains] No suitable unannounced services found')
        return
      }

      console.log(firstUnannounced)

      markTrainIdAnnounced(firstUnannounced.serviceIdGuid)

      const h = firstUnannounced.std.split(':')[0]
      const m = firstUnannounced.std.split(':')[1]

      const delayMins = calculateDelayMins(firstUnannounced.std, firstUnannounced.etd)

      console.log(`[Live Trains] Is delayed by ${delayMins} mins`)

      const toc = processToc(firstUnannounced.operator, firstUnannounced.origin[0].crs, firstUnannounced.destination[0].crs)

      const callingPoints = firstUnannounced.subsequentCallingPoints[0].callingPoint

      const callingAt = (callingPoints as any[])
        .map((p): any | null => {
          if (p.isCancelled || p.et === 'Cancelled') return null
          if (!system.stations.includes(p.crs)) return null

          return p
        })
        .filter(x => !!x)
        .map((p, i, arr): CallingAtPoint | null => {
          console.log(`[${i} of ${arr.length - 1}]: ${p.crs}`)

          if (i === arr.length - 1 && p.crs === firstUnannounced.destination[0].crs) return null

          return {
            crsCode: p.crs,
            name: '',
            randomId: '',
          }
        })
        .filter(x => !!x) as CallingAtPoint[]

      const vias: CallingAtPoint[] = []

      if (firstUnannounced.destination[0].via) {
        const v: string = firstUnannounced.destination[0].via.startsWith('via ')
          ? firstUnannounced.destination[0].via.slice(4)
          : firstUnannounced.destination[0].via

        v.split(/(&|and)/).forEach(via => {
          const guessViaCrs = stationNameToCrsMap[via.trim().toLowerCase()]

          console.log(`[Live Trains] Guessed via ${guessViaCrs} for ${via}`)

          if (guessViaCrs) {
            vias.push({
              crsCode: guessViaCrs,
              name: '',
              randomId: '',
            })
          }
        })
      }

      const options: INextTrainAnnouncementOptions = {
        chime: 'four',
        hour: h === '00' ? '00 - midnight' : h,
        min: m === '00' ? '00 - hundred' : m,
        isDelayed: delayMins > 5,
        toc,
        coaches: firstUnannounced.length ? `${firstUnannounced.length} coaches` : null,
        platform: system.platforms.includes(firstUnannounced.platform.toLowerCase()) ? firstUnannounced.platform.toLowerCase() : '1',
        terminatingStationCode: firstUnannounced.destination[0].crs,
        vias,
        callingAt,
      }

      console.log(options)
      try {
        if (abortController.signal.aborted) {
          console.warn('[Live Trains] Aborted; skipping announcement')
          return
        }

        setIsPlaying(true)
        console.log(
          `[Live Trains] Playing announcement for ${firstUnannounced.serviceIdGuid} (${firstUnannounced.std} to ${firstUnannounced.destination[0].locationName})`,
        )
        await nextTrainHandler(options)
      } catch (e) {
        console.warn(`[Live Trains] Error playing announcement for ${firstUnannounced.serviceIdGuid}; see below`)
        console.error(e)
      }
      console.log(`[Live Trains] Announcement for ${firstUnannounced.serviceIdGuid} complete: waiting 5s until next`)
      setTimeout(() => setIsPlaying(false), 5000)
    }

    const refreshInterval = setInterval(checkAndPlay, 10_000)
    checkAndPlay()

    return () => {
      console.log('Clearing interval', refreshInterval)
      clearInterval(refreshInterval)
      abortController.abort()
    }
  }, [
    hasEnabledFeature,
    nextTrainAnnounced,
    markTrainIdAnnounced,
    system,
    nextTrainHandler,
    selectedCrs,
    isPlaying,
    setIsPlaying,
    calculateDelayMins,
  ])

  return (
    <div>
      <label className="option-select" htmlFor="station-select">
        Station
        <Select<Option, false>
          id="station-select"
          value={{ value: selectedCrs, label: supportedStations.find(option => option.value === selectedCrs)?.label || '' }}
          onChange={val => {
            setselectedCrs(val!!.value)
          }}
          options={supportedStations}
        />
      </label>

      <p style={{ margin: '16px 0' }}>
        This is a beta feature, and isn't complete or fully functional. Please report any issues you face on GitHub.
      </p>
      <p style={{ margin: '16px 0' }}>
        This page will auto-announce all departures in the next {MIN_TIME_TO_ANNOUNCE} minutes from the selected station. Departures outside this
        timeframe will appear on the board below, but won't be announced until closer to the time.
      </p>
      <p style={{ margin: '16px 0' }}>At the moment, we also won't announce services which:</p>
      <ul className="list" style={{ margin: '16px 16px' }}>
        <li>have no platform allocated in data feeds (common at larger stations, even at the time of departure)</li>
        <li>are marked as cancelled or have an estimated time of "delayed"</li>
        <li>have already been announced by the system in the last hour (only affects services which suddenly get delayed)</li>
      </ul>
      <p>
        We also can't handle splits (we'll only announce the main portion), request stops, short platforms and several more features. As I said,
        it's a beta!
      </p>

      {!hasEnabledFeature ? (
        <>
          <button className={classes.fullscreenButton} onClick={() => setHasEnabledFeature(true)}>
            Enable live trains
          </button>
        </>
      ) : (
        <>
          <button className={classes.fullscreenButton} onClick={() => setFullscreen(true)}>
            <FullscreenIcon style={{ marginRight: 4 }} /> Fullscreen
          </button>

          <FullScreen enabled={isFullscreen} onChange={setFullscreen}>
            <iframe
              className={classes.iframe}
              src={`https://raildotmatrix.davwheat.dev/board/?type=gtr-new&station=${selectedCrs}&noBg=1&hideSettings=1`}
            />
          </FullScreen>
        </>
      )}
    </div>
  )
}